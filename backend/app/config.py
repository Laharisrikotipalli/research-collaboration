"""
Configuration loaded strictly from environment variables.
Never hardcode CognoDB credentials here or anywhere in the repo.
"""
import os
from dotenv import load_dotenv

load_dotenv()  # loads from a local .env file in development; in prod, real env vars are used


class Settings:
    COGNODB_URI: str = os.environ.get("COGNODB_URI", "")
    COGNODB_USERNAME: str = os.environ.get("COGNODB_USERNAME", "cognodb")
    COGNODB_PASSWORD: str = os.environ.get("COGNODB_PASSWORD", "")

    CORS_ORIGINS: list[str] = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

    def validate(self) -> None:
        missing = [
            name
            for name, value in [
                ("COGNODB_URI", self.COGNODB_URI),
                ("COGNODB_USERNAME", self.COGNODB_USERNAME),
                ("COGNODB_PASSWORD", self.COGNODB_PASSWORD),
            ]
            if not value
        ]
        if missing:
            raise RuntimeError(
                f"Missing required environment variables: {', '.join(missing)}. "
                "Copy .env.example to .env and fill in your CognoDB connection details."
            )


settings = Settings()
