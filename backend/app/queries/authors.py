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
  (a:Author {id: $author_a})-[:AUTHORED*2..6]-(b:Author {id: $author_b})
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
WITH a, b, collect(DISTINCT t.name) AS shared_topics
OPTIONAL MATCH (a)-[:AUTHORED]->(sp:Paper)<-[:AUTHORED]-(b)
WITH b, shared_topics, sp
WHERE sp IS NULL
RETURN DISTINCT b.id AS id, b.name AS name, b.institution AS institution,
       shared_topics
ORDER BY size(shared_topics) DESC
LIMIT 25
"""