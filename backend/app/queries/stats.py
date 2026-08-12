"""Cypher queries for dataset-wide statistics (used on the homepage)."""

DATASET_STATS = """
MATCH (a:Author)
WITH count(a) AS authors
MATCH (p:Paper)
WITH authors, count(p) AS papers
MATCH (t:Topic)
WITH authors, papers, count(t) AS topics
MATCH ()-[r:AUTHORED|CITES|ABOUT]->()
RETURN authors, papers, topics, count(r) AS relationships
"""
