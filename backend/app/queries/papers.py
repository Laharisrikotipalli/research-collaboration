"""Cypher queries related to papers and citations."""

SEARCH_PAPERS = """
MATCH (p:Paper)
WHERE toLower(p.title) CONTAINS toLower($title)
RETURN p.id AS id, p.title AS title, p.year AS year, p.citation_count AS citation_count
ORDER BY p.citation_count DESC
LIMIT 20
"""

# Shared shape for the Papers page cards: title/year/citations plus the
# authors and topics needed to render the card without a second round trip.
_PAPER_CARD_TAIL = """
OPTIONAL MATCH (a:Author)-[:AUTHORED]->(p)
WITH p, collect(DISTINCT {id: a.id, name: a.name}) AS authors
OPTIONAL MATCH (p)-[:ABOUT]->(t:Topic)
WITH p, authors, collect(DISTINCT {id: t.id, name: t.name}) AS topics
RETURN p.id AS id, p.title AS title, p.year AS year, p.citation_count AS citation_count,
       authors, topics
"""

# Default "Featured Research" list for the Papers page on initial load —
# no search term needed, ranked by citation count.
FEATURED_PAPERS = (
    """
MATCH (p:Paper)
WITH p ORDER BY p.citation_count DESC LIMIT 9
"""
    + _PAPER_CARD_TAIL
    + "\nORDER BY p.citation_count DESC\n"
)

# Same card shape, filtered by title — used so search results render with
# the same authors/topics cards as the featured/default list.
SEARCH_PAPERS_WITH_CARDS = (
    """
MATCH (p:Paper)
WHERE toLower(p.title) CONTAINS toLower($title)
WITH p ORDER BY p.citation_count DESC LIMIT 20
"""
    + _PAPER_CARD_TAIL
    + "\nORDER BY p.citation_count DESC\n"
)

GET_PAPER = """
MATCH (p:Paper {id: $paper_id})
OPTIONAL MATCH (a:Author)-[:AUTHORED]->(p)
OPTIONAL MATCH (p)-[:ABOUT]->(t:Topic)
RETURN p.id AS id, p.title AS title, p.year AS year, p.abstract AS abstract,
       p.citation_count AS citation_count,
       collect(DISTINCT {id: a.id, name: a.name}) AS authors,
       collect(DISTINCT {id: t.id, name: t.name}) AS topics
"""

GET_CITATIONS_OUT = """
MATCH (p:Paper {id: $paper_id})-[:CITES]->(cited:Paper)
RETURN cited.id AS id, cited.title AS title, cited.year AS year
ORDER BY cited.year DESC
"""

GET_CITATIONS_IN = """
MATCH (p:Paper {id: $paper_id})<-[:CITES]-(citing:Paper)
RETURN citing.id AS id, citing.title AS title, citing.year AS year
ORDER BY citing.year DESC
"""

# Multi-hop (2 hops): the paper's citation neighborhood - papers it cites,
# and papers those papers cite in turn. This kind of expanding, variable-depth
# neighborhood query is exactly what a relational schema struggles to express
# cleanly without recursive CTEs that degrade quickly with depth.
CITATION_NEIGHBORHOOD = """
MATCH path = (p:Paper {id: $paper_id})-[:CITES*1..2]->(related:Paper)
RETURN [n IN nodes(path) | {id: n.id, title: n.title, year: n.year}] AS chain,
       length(path) AS hops
ORDER BY hops
"""
