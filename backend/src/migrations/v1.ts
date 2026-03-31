export const up = async (db: any) => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS progetti (
      id_p INT(11) NOT NULL AUTO_INCREMENT,
      Nome_P VARCHAR(200) NOT NULL,
      Descrizione_P TEXT DEFAULT NULL,
      Data_P DATE DEFAULT NULL,
      repo_git VARCHAR(500) DEFAULT NULL,
      readme_link VARCHAR(500) DEFAULT NULL,
      PRIMARY KEY (id_p)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

export const down = async (db: any) => {
  await db.execute(`DROP TABLE IF EXISTS progetti`);
};