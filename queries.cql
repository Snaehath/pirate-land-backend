CREATE TABLE IF NOT EXISTS user_tokens (
    user_id TEXT, 
    token TEXT, 
    PRIMARY KEY (user_id, token)
) WITH CLUSTERING ORDER BY (token ASC);