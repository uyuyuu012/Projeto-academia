create database if not exists dbescola;
use dbescola;

create table if not exists texte(
    ID int primary key,
    Nome text not null,
    UserStatus text not null    
);

delimiter $$
create procedure inserirCliente (in Nome varchar(100))
begin
    insert into texte (nome slk)
end
$$
