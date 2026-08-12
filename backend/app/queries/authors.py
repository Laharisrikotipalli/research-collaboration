"""
Cypher queries related to authors. Kept separate from route handlers so
the query layer can be read, tested, and defended on its own.
"""

SEARCH_AUTHORS = """
MATCH (a:Author)
WHERE toLower(a.name) CONTAINS toLower($name)
RETURN a.id AS id, a.name AS name, a.institution AS institution, a.h_index AS h_index
ORDER BY a.name
LIMIT 20
"""

# Shared shape for the Authors page cards: name/institution/h-index plus the
# three headline counts (papers, co-authors, topics). Each count is deduped
# via its own collect(DISTINCT ...) stage so fan-out across the three
# relationship hops doesn't inflate the totals.
_AUTHOR_CARD_STATS_TAIL = """
OPTIONAL MATCH (a)-[:AUTHORED]->(p:Paper)
WITH a, collect(DISTINCT p) AS papers
OPTIONAL MATCH (a)-[:AUTHORED]->(:Paper)<-[:AUTHORED]-(co:Author)
WHERE co <> a
WITH a, papers, collect(DISTINCT co) AS coauthors
OPTIONAL MATCH (a)-[:AUTHORED]->(:Paper)-[:ABOUT]->(t:Topic)
WITH a, papers, coauthors, collect(DISTINCT t) AS topics
RETURN a.id AS id, a.name AS name, a.institution AS institution, a.h_index AS h_index,
       size(papers) AS papers_count, size(coauthors) AS co_authors_count,
       size(topics) AS topics_count
"""

# Default "Featured Researchers" list for the Authors page on initial load —
# no search term needed, ranked by h-index.
FEATURED_AUTHORS = (
    """
MATCH (a:Author)
WITH a ORDER BY a.h_index DESC LIMIT 9
"""
    + _AUTHOR_CARD_STATS_TAIL
    + "\nORDER BY a.h_index DESC\n"
)

# Same card shape, filtered by name — used so search results render with
# the same stat cards as the featured/default list instead of a plainer row.
SEARCH_AUTHORS_WITH_STATS = (
    """
MATCH (a:Author)
WHERE toLower(a.name) CONTAINS toLower($name)
WITH a ORDER BY a.name LIMIT 20
"""
    + _AUTHOR_CARD_STATS_TAIL
    + "\nORDER BY a.name\n"
)

GET_AUTHOR = """
MATCH (a:Author {id: $author_id})
RETURN a.id AS id, a.name AS name, a.institution AS institution, a.h_index AS h_index
"""

# 1-hop: author's own papers
GET_AUTHOR_PAPERS = """
MATCH (a:Author {id: $author_id})-[:AUTHORED]->(p:Paper)
RETURN p.id AS id, p.title AS title, p.year AS year, p.citation_count AS citation_count
ORDER BY p.year DESC
"""

# 2-hop: co-authors, reached via shared papers
GET_CO_AUTHORS = """
MATCH (a:Author {id: $author_id})-[:AUTHORED]->(p:Paper)<-[:AUTHORED]-(co:Author)
WHERE co.id <> $author_id
RETURN DISTINCT co.id AS id, co.name AS name, co.institution AS institution,
       count(p) AS shared_papers
ORDER BY shared_papers DESC
"""

GET_AUTHOR_TOPICS = """
MATCH (a:Author {id: $author_id})-[:AUTHORED]->(:Paper)-[:ABOUT]->(t:Topic)
RETURN DISTINCT t.id AS id, t.name AS name
ORDER BY t.name
"""

# Multi-hop (2+): shortest collaboration path between two authors, going
# author -> paper -> author -> paper -> author ... This is the traversal
# a relational schema would need recursive self-joins to express.
SHORTEST_COLLABORATION_PATH = """
MATCH path = shortestPath(
  (a:Author {id: $author_a})-[:AUTHORED*2..10]-(b:Author {id: $author_b})
)
RETURN [n IN nodes(path) | {
          label: head(labels(n)),
          id: n.id,
          name: coalesce(n.name, n.title)
        }] AS nodes,
       length(path) AS hops
"""

# Graph-native question with no clean relational equivalent: authors who
# share a research topic but have never co-authored a paper together.
POTENTIAL_COLLABORATORS = """
MATCH (a:Author {id: $author_id})-[:AUTHORED]->(:Paper)-[:ABOUT]->(t:Topic)
MATCH (b:Author)-[:AUTHORED]->(:Paper)-[:ABOUT]->(t)
WHERE a <> b
  AND NOT EXISTS {
    MATCH (a)-[:AUTHORED]->(:Paper)<-[:AUTHORED]-(b)
  }
RETURN DISTINCT b.id AS id, b.name AS name, b.institution AS institution,
       collect(DISTINCT t.name) AS shared_topics
ORDER BY size(shared_topics) DESC
LIMIT 25
"""
