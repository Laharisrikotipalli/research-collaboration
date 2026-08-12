"""
Thin wrapper around the official Neo4j Python driver, pointed at CognoDB.
CognoDB speaks openCypher over Bolt, so the standard driver works unmodified.
"""
import logging
from contextlib import contextmanager

from neo4j import GraphDatabase
from neo4j.exceptions import ServiceUnavailable, AuthError, Neo4jError

from app.config import settings

logger = logging.getLogger("db")

_driver = None


def get_driver():
    """Lazily create a single shared driver instance."""
    global _driver
    if _driver is None:
        settings.validate()
        _driver = GraphDatabase.driver(
            settings.COGNODB_URI,
            auth=(settings.COGNODB_USERNAME, settings.COGNODB_PASSWORD),
        )
    return _driver


def close_driver():
    global _driver
    if _driver is not None:
        _driver.close()
        _driver = None


def verify_connectivity() -> bool:
    """Used by a health-check endpoint and at startup so failures are surfaced clearly."""
    try:
        get_driver().verify_connectivity()
        return True
    except (ServiceUnavailable, AuthError) as exc:
        logger.error("CognoDB connectivity check failed: %s", exc)
        return False


class DatabaseUnavailableError(Exception):
    """Raised when CognoDB cannot be reached; routes translate this into a 503."""


@contextmanager
def get_session():
    """
    Context manager yielding a Neo4j session, translating driver-level
    connection failures into a single application-level exception so
    routes don't need to know about driver internals.
    """
    try:
        driver = get_driver()
        session = driver.session()
    except (ServiceUnavailable, AuthError) as exc:
        raise DatabaseUnavailableError(str(exc)) from exc

    try:
        yield session
    except (ServiceUnavailable, AuthError) as exc:
        raise DatabaseUnavailableError(str(exc)) from exc
    except Neo4jError as exc:
        # Query-level errors (bad Cypher, constraint violations) are not
        # connectivity issues - let them propagate so routes can 400/500 appropriately.
        logger.error("Neo4j query error: %s", exc)
        raise
    finally:
        session.close()


def run_query(cypher: str, parameters: dict | None = None) -> list[dict]:
    """
    Execute a single parameterised Cypher query and return a list of plain dicts.
    All application code should go through this function rather than
    building sessions/transactions ad hoc, so the error-handling path is consistent.
    """
    with get_session() as session:
        result = session.run(cypher, parameters or {})
        return [record.data() for record in result]
