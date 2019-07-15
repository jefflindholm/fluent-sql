-- Up
create table users
(
    id serial primary key,
    username text not null UNIQUE,
    email text not null UNIQUE,
    password text not null,
    created timestamp default current_timestamp
)

-- Down
drop table users;
