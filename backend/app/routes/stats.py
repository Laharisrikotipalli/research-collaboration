from fastapi import APIRouter, HTTPException

from app.db import run_query, DatabaseUnavailableError
from app.queries import stats as q

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("")
def get_stats():
    """Dataset-wide counts (researchers, papers, topics, relationships) for the homepage."""
    try:
        rows = run_query(q.DATASET_STATS)
        if not rows:
            return {"authors": 0, "papers": 0, "topics": 0, "relationships": 0}
        return rows[0]
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")
