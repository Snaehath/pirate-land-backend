CREATE TABLE IF NOT EXISTS tokens (
    id TEXT, 
    tkn TEXT, 
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT, 
    name TEXT, 
    avatar INT,
    PRIMARY KEY (id)
);