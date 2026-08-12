"""
Deterministic seed data generator for the Research Collaboration Explorer.

Generates a realistic, reproducible research graph (no external API calls,
no rate limits) and loads it into CognoDB using parameterised Cypher via
the official Neo4j driver.

Run with:
    python -m scripts.seed
from the backend/ directory, with COGNODB_* env vars set.
"""
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from neo4j import GraphDatabase
from app.config import settings

random.seed(42)  # reproducible dataset

INSTITUTIONS = [
    "MIT", "Stanford University", "ETH Zurich", "IIT Bombay", "University of Toronto",
    "Carnegie Mellon University", "University of Cambridge", "UC Berkeley",
    "National University of Singapore", "Max Planck Institute", "TU Munich",
    "IISc Bangalore", "Cornell University", "University of Tokyo", "EPFL",
]

TOPICS = [
    "Graph Neural Networks", "Distributed Systems", "Natural Language Processing",
    "Computer Vision", "Reinforcement Learning", "Database Systems",
    "Cryptography", "Human-Computer Interaction", "Robotics",
    "Program Synthesis", "Federated Learning", "Causal Inference",
    "Knowledge Graphs", "Systems Security", "Computational Biology",
]

FIRST_NAMES = [
    "Ava", "Noah", "Priya", "Wei", "Elena", "Kwame", "Sofia", "Ravi", "Yuki",
    "Omar", "Lena", "Diego", "Aisha", "Lucas", "Mei", "Ivan", "Zara", "Tomas",
    "Nadia", "Kenji", "Isabel", "Arjun", "Chloe", "Hassan", "Freya", "Mateo",
]
LAST_NAMES = [
    "Sharma", "Chen", "Kowalski", "Mensah", "Rossi", "Patel", "Nakamura",
    "Alvarez", "Novak", "Silva", "Kim", "Fischer", "Okafor", "Ivanova",
    "Bergström", "Reyes", "Yamamoto", "Haddad", "Costa", "Larsen",
]

TITLE_TEMPLATES = [
    "Scalable {topic}: A Systems Perspective",
    "Rethinking {topic} for Large-Scale Deployment",
    "Towards Robust {topic}",
    "A Unified Framework for {topic}",
    "Efficient {topic} under Resource Constraints",
    "On the Limits of {topic}",
    "{topic}: Theory and Practice",
    "Benchmarking Modern Approaches to {topic}",
    "Interpretable Methods in {topic}",
    "Bridging Theory and Application in {topic}",
]

N_AUTHORS = 150
N_PAPERS = 400
YEARS = list(range(2014, 2025))


def gen_authors():
    used_names = set()
    authors = []
    for i in range(N_AUTHORS):
        while True:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            if name not in used_names:
                used_names.add(name)
                break
        authors.append({
            "id": f"author-{i+1}",
            "name": name,
            "institution": random.choice(INSTITUTIONS),
            "h_index": random.randint(1, 60),
        })
    return authors


def gen_topics():
    return [{"id": f"topic-{i+1}", "name": t} for i, t in enumerate(TOPICS)]


def gen_papers(topics):
    papers = []
    for i in range(N_PAPERS):
        topic = random.choice(topics)
        title = random.choice(TITLE_TEMPLATES).format(topic=topic["name"])
        papers.append({
            "id": f"paper-{i+1}",
            "title": title,
            "year": random.choice(YEARS),
            "abstract": (
                f"This paper investigates {topic['name'].lower()} and presents "
                f"empirical results across multiple benchmark settings."
            ),
            "citation_count": 0,  # computed after citation edges are generated
            "primary_topic": topic["id"],
        })
    return papers


def gen_authorships(authors, papers):
    """Each paper gets 1-4 authors; authors skew toward a handful of frequent topics
    (via co-authorship clustering) so co-author and collaboration-path queries are meaningful."""
    authorships = []
    # Give every author a "home cluster" of a few peers they tend to publish with.
    clusters = []
    remaining = authors[:]
    random.shuffle(remaining)
    while remaining:
        size = min(len(remaining), random.randint(3, 6))
        clusters.append(remaining[:size])
        remaining = remaining[size:]

    for paper in papers:
        cluster = random.choice(clusters)
        n_authors = min(len(cluster), random.randint(1, 4))
        chosen = random.sample(cluster, n_authors)
        for a in chosen:
            authorships.append({"author_id": a["id"], "paper_id": paper["id"]})
    return authorships


def gen_paper_topics(papers, topics):
    """Primary topic plus a chance of 1-2 secondary topics."""
    edges = []
    for paper in papers:
        edges.append({"paper_id": paper["id"], "topic_id": paper["primary_topic"]})
        if random.random() < 0.4:
            secondary = random.choice(topics)
            if secondary["id"] != paper["primary_topic"]:
                edges.append({"paper_id": paper["id"], "topic_id": secondary["id"]})
    return edges


def gen_citations(papers):
    """Papers can only cite earlier or same-year papers, keeping the graph a DAG-ish structure."""
    edges = []
    by_year = sorted(papers, key=lambda p: p["year"])
    for idx, paper in enumerate(by_year):
        candidates = [p for p in by_year[:idx] if p["year"] <= paper["year"]]
        if not candidates:
            continue
        n_citations = min(len(candidates), random.randint(0, 6))
        for cited in random.sample(candidates, n_citations):
            edges.append({"citing_id": paper["id"], "cited_id": cited["id"]})
    return edges


def compute_citation_counts(papers, citations):
    counts = {p["id"]: 0 for p in papers}
    for edge in citations:
        counts[edge["cited_id"]] = counts.get(edge["cited_id"], 0) + 1
    for p in papers:
        p["citation_count"] = counts.get(p["id"], 0)
    return papers


def load(driver, authors, topics, papers, authorships, paper_topics, citations):
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

        session.run(
            "UNWIND $rows AS row CREATE (:Author {id: row.id, name: row.name, "
            "institution: row.institution, h_index: row.h_index})",
            rows=authors,
        )
        session.run(
            "UNWIND $rows AS row CREATE (:Topic {id: row.id, name: row.name})",
            rows=topics,
        )
        session.run(
            "UNWIND $rows AS row CREATE (:Paper {id: row.id, title: row.title, "
            "year: row.year, abstract: row.abstract, citation_count: row.citation_count})",
            rows=papers,
        )

        session.run("CREATE CONSTRAINT author_id IF NOT EXISTS FOR (a:Author) REQUIRE a.id IS UNIQUE")
        session.run("CREATE CONSTRAINT paper_id IF NOT EXISTS FOR (p:Paper) REQUIRE p.id IS UNIQUE")
        session.run("CREATE CONSTRAINT topic_id IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE")

        session.run(
            "UNWIND $rows AS row MATCH (a:Author {id: row.author_id}), (p:Paper {id: row.paper_id}) "
            "CREATE (a)-[:AUTHORED]->(p)",
            rows=authorships,
        )
        session.run(
            "UNWIND $rows AS row MATCH (p:Paper {id: row.paper_id}), (t:Topic {id: row.topic_id}) "
            "CREATE (p)-[:ABOUT]->(t)",
            rows=paper_topics,
        )
        session.run(
            "UNWIND $rows AS row MATCH (a:Paper {id: row.citing_id}), (b:Paper {id: row.cited_id}) "
            "CREATE (a)-[:CITES]->(b)",
            rows=citations,
        )


def main():
    settings.validate()
    authors = gen_authors()
    topics = gen_topics()
    papers = gen_papers(topics)
    authorships = gen_authorships(authors, papers)
    paper_topics = gen_paper_topics(papers, topics)
    citations = gen_citations(papers)
    papers = compute_citation_counts(papers, citations)

    print(f"Generated {len(authors)} authors, {len(papers)} papers, {len(topics)} topics")
    print(f"{len(authorships)} AUTHORED, {len(paper_topics)} ABOUT, {len(citations)} CITES edges")

    driver = GraphDatabase.driver(
        settings.COGNODB_URI, auth=(settings.COGNODB_USERNAME, settings.COGNODB_PASSWORD)
    )
    try:
        load(driver, authors, topics, papers, authorships, paper_topics, citations)
        print("Seed complete.")
    finally:
        driver.close()


if __name__ == "__main__":
    main()
