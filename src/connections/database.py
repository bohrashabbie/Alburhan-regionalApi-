# src/database_connection.py

from config.settings import DB_SERVER, DB_NAME, DB_PORT
import logging

logger = logging.getLogger(__name__)


class DatabaseConnections:

    def __init__(self):
        self.server = DB_SERVER
        self.port = DB_PORT
        self.database = DB_NAME
        self.dburl = self._build_connection_string()

    def _build_connection_string(self):
        return (
            f"mssql+pyodbc://@{self.server}:{self.port}/{self.database}"
            "?driver=ODBC+Driver+17+for+SQL+Server"
            "&trusted_connection=yes"
            "&TrustServerCertificate=yes"
        )

    def get_url(self):
        return self.dburl