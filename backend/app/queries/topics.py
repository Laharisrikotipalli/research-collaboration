"""Cypher queries related to topics."""

LIST_TOPICS = """
MATCH (t:Topic)
OPTIONAL MATCH (t)<-[:ABOUT]-(p:Paper)
RETURN t.id AS id, t.name AS name, count(p) AS paper_count
ORDER BY paper_count DESC
"""

GET_TOPIC_PAPERS = """
MATCH (t:Topic {id: $topic_id})<-[:ABOUT]-(p:Paper)
RETURN p.id AS id, p.title AS title, p.year AS year, p.citation_count AS citation_count
ORDER BY p.citation_count DESC
"""

GET_TOPIC_AUTHORS = """
MATCH (t:Topic {id: $topic_id})<-[:ABOUT]-(:Paper)<-[:AUTHORED]-(a:Author)
RETURN DISTINCT a.id AS id, a.name AS name, a.institution AS institution,
       count(*) AS papers_in_topic
ORDER BY papers_in_topic DESC
"""

# Related topics: topics that frequently co-occur on the same papers as the
# given topic - a similarity signal that falls out naturally from the graph
# shape rather than needing a separate precomputed similarity table.
RELATED_TOPICS = """
MATCH (t:Topic {id: $topic_id})<-[:ABOUT]-(p:Paper)-[:ABOUT]->(related:Topic)
WHERE related.id <> $topic_id
RETURN related.id AS id, related.name AS name, count(p) AS shared_papers
ORDER BY shared_papers DESC
LIMIT 10
"""
