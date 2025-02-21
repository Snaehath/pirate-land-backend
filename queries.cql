CREATE TABLE IF NOT EXISTS tokens (
    id TEXT,
    tkn TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT,
    name TEXT,
    avatar INT,
    current_game TIMEUUID,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS islands (
    id TIMEUUID,
    creator TEXT,
    invitee TEXT,
    creator_payed BOOLEAN,
    invitee_payed BOOLEAN,
    chance TEXT,
    status TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS boards (
    id TIMEUUID,
    player_id TEXT,
    positions TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS scorecards (
    id TIMEUUID,
    creator_score INT,
    invitee_score INT,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS history (
    player_id TEXT,
    id TIMEUUID,
    status TEXT,
    opponent TEXT,
    PRIMARY KEY (player_id, id)
) WITH CLUSTERING ORDER BY (id DESC);

CREATE TABLE IF NOT EXISTS messages (
    island_id TIMEUUID,
    id TIMEUUID,
    sender TEXT,
    receiver TEXT,
    message TEXT,
    PRIMARY KEY (island_id, id)
) WITH CLUSTERING ORDER BY (id DESC);
