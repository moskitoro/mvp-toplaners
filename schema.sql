BEGIN;

DROP TABLE IF EXISTS tbl_Comparacion_X_Metrica CASCADE;
DROP TABLE IF EXISTS tbl_Comparacion_X_Jugador CASCADE;
DROP TABLE IF EXISTS tbl_Jugador_X_Partida CASCADE;
DROP TABLE IF EXISTS tbl_Usuario_X_Jugador CASCADE;
DROP TABLE IF EXISTS tbl_Comparacion CASCADE;
DROP TABLE IF EXISTS tbl_Metrica CASCADE;
DROP TABLE IF EXISTS tbl_Partida CASCADE;
DROP TABLE IF EXISTS tbl_Jugador CASCADE;
DROP TABLE IF EXISTS tbl_Usuario CASCADE;
DROP TABLE IF EXISTS tbl_Campeon CASCADE;
DROP TABLE IF EXISTS tbl_Rol CASCADE;
DROP TABLE IF EXISTS tbl_Parche CASCADE;
DROP TABLE IF EXISTS tbl_Estado CASCADE;

CREATE TABLE tbl_Estado (
    ID integer GENERATED ALWAYS AS IDENTITY,
    nombre varchar(50) NOT NULL,
    CONSTRAINT pk_tbl_estado PRIMARY KEY (ID),
    CONSTRAINT uq_tbl_estado_nombre UNIQUE (nombre),
    CONSTRAINT chk_tbl_estado_nombre_no_vacio CHECK (btrim(nombre) <> '')
);

CREATE TABLE tbl_Rol (
    ID integer GENERATED ALWAYS AS IDENTITY,
    nombre varchar(50) NOT NULL,
    CONSTRAINT pk_tbl_rol PRIMARY KEY (ID),
    CONSTRAINT uq_tbl_rol_nombre UNIQUE (nombre),
    CONSTRAINT chk_tbl_rol_nombre_no_vacio CHECK (btrim(nombre) <> '')
);

CREATE TABLE tbl_Parche (
    ID integer GENERATED ALWAYS AS IDENTITY,
    version varchar(20) NOT NULL,
    fecha_lanzamiento date NOT NULL,
    CONSTRAINT pk_tbl_parche PRIMARY KEY (ID),
    CONSTRAINT uq_tbl_parche_version UNIQUE (version),
    CONSTRAINT chk_tbl_parche_version_no_vacio CHECK (btrim(version) <> '')
);

CREATE TABLE tbl_Usuario (
    ID integer GENERATED ALWAYS AS IDENTITY,
    ID_Estado integer NOT NULL,
    google_uid varchar(200) NOT NULL,
    email varchar(200) NOT NULL,
    nombre varchar(200) NOT NULL,
    CONSTRAINT pk_tbl_usuario PRIMARY KEY (ID),
    CONSTRAINT fk_tbl_usuario_estado FOREIGN KEY (ID_Estado)
        REFERENCES tbl_Estado(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_tbl_usuario_google_uid UNIQUE (google_uid),
    CONSTRAINT uq_tbl_usuario_email UNIQUE (email),
    CONSTRAINT chk_tbl_usuario_google_uid_no_vacio CHECK (btrim(google_uid) <> ''),
    CONSTRAINT chk_tbl_usuario_email_no_vacio CHECK (btrim(email) <> ''),
    CONSTRAINT chk_tbl_usuario_nombre_no_vacio CHECK (btrim(nombre) <> '')
);

CREATE TABLE tbl_Jugador (
    ID integer GENERATED ALWAYS AS IDENTITY,
    ID_Estado integer NOT NULL,
    puuid varchar(120) NOT NULL,
    game_name varchar(80) NOT NULL,
    tag_line varchar(20) NOT NULL,
    region varchar(20) NOT NULL,
    nivel integer NOT NULL,
    rango_actual varchar(30),
    CONSTRAINT pk_tbl_jugador PRIMARY KEY (ID),
    CONSTRAINT fk_tbl_jugador_estado FOREIGN KEY (ID_Estado)
        REFERENCES tbl_Estado(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_tbl_jugador_puuid UNIQUE (puuid),
    CONSTRAINT uq_tbl_jugador_identidad_riot UNIQUE (game_name, tag_line, region),
    CONSTRAINT chk_tbl_jugador_puuid_no_vacio CHECK (btrim(puuid) <> ''),
    CONSTRAINT chk_tbl_jugador_game_name_no_vacio CHECK (btrim(game_name) <> ''),
    CONSTRAINT chk_tbl_jugador_tag_line_no_vacio CHECK (btrim(tag_line) <> ''),
    CONSTRAINT chk_tbl_jugador_region_no_vacio CHECK (btrim(region) <> ''),
    CONSTRAINT chk_tbl_jugador_nivel_valido CHECK (nivel >= 0)
);

CREATE TABLE tbl_Campeon (
    ID integer GENERATED ALWAYS AS IDENTITY,
    nombre varchar(60) NOT NULL,
    tipo_danio varchar(30) NOT NULL,
    recurso varchar(30) NOT NULL,
    CONSTRAINT pk_tbl_campeon PRIMARY KEY (ID),
    CONSTRAINT uq_tbl_campeon_nombre UNIQUE (nombre),
    CONSTRAINT chk_tbl_campeon_nombre_no_vacio CHECK (btrim(nombre) <> ''),
    CONSTRAINT chk_tbl_campeon_tipo_danio_no_vacio CHECK (btrim(tipo_danio) <> ''),
    CONSTRAINT chk_tbl_campeon_recurso_no_vacio CHECK (btrim(recurso) <> '')
);

CREATE TABLE tbl_Partida (
    ID integer GENERATED ALWAYS AS IDENTITY,
    ID_Parche integer NOT NULL,
    riot_match_id varchar(100) NOT NULL,
    modo_juego varchar(50) NOT NULL,
    duracion_segundos integer NOT NULL,
    fecha_partida date NOT NULL,
    queue_id varchar(40),
    version_partida varchar(20),
    CONSTRAINT pk_tbl_partida PRIMARY KEY (ID),
    CONSTRAINT fk_tbl_partida_parche FOREIGN KEY (ID_Parche)
        REFERENCES tbl_Parche(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_tbl_partida_riot_match_id UNIQUE (riot_match_id),
    CONSTRAINT chk_tbl_partida_riot_match_id_no_vacio CHECK (btrim(riot_match_id) <> ''),
    CONSTRAINT chk_tbl_partida_modo_juego_no_vacio CHECK (btrim(modo_juego) <> ''),
    CONSTRAINT chk_tbl_partida_duracion_valida CHECK (duracion_segundos > 0)
);

CREATE TABLE tbl_Comparacion (
    ID integer GENERATED ALWAYS AS IDENTITY,
    ID_Usuario integer NOT NULL,
    titulo varchar(120) NOT NULL,
    descripcion text,
    rol_evaluado varchar(30) NOT NULL,
    fecha_comparacion date NOT NULL,
    resultado_final varchar(40),
    recomendacion_IA text,
    CONSTRAINT pk_tbl_comparacion PRIMARY KEY (ID),
    CONSTRAINT fk_tbl_comparacion_usuario FOREIGN KEY (ID_Usuario)
        REFERENCES tbl_Usuario(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_tbl_comparacion_titulo_no_vacio CHECK (btrim(titulo) <> ''),
    CONSTRAINT chk_tbl_comparacion_rol_evaluado_no_vacio CHECK (btrim(rol_evaluado) <> '')
);

CREATE TABLE tbl_Metrica (
    ID integer GENERATED ALWAYS AS IDENTITY,
    nombre varchar(50) NOT NULL,
    descripcion varchar(200),
    peso numeric(6,2) NOT NULL,
    CONSTRAINT pk_tbl_metrica PRIMARY KEY (ID),
    CONSTRAINT uq_tbl_metrica_nombre UNIQUE (nombre),
    CONSTRAINT chk_tbl_metrica_nombre_no_vacio CHECK (btrim(nombre) <> ''),
    CONSTRAINT chk_tbl_metrica_peso_rango CHECK (peso >= 0 AND peso <= 100)
);

CREATE TABLE tbl_Usuario_X_Jugador (
    ID integer GENERATED ALWAYS AS IDENTITY,
    ID_Usuario integer NOT NULL,
    ID_Jugador integer NOT NULL,
    alias_local varchar(80),
    fecha_asociacion date NOT NULL,
    CONSTRAINT pk_tbl_usuario_x_jugador PRIMARY KEY (ID),
    CONSTRAINT fk_tbl_usuario_x_jugador_usuario FOREIGN KEY (ID_Usuario)
        REFERENCES tbl_Usuario(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_tbl_usuario_x_jugador_jugador FOREIGN KEY (ID_Jugador)
        REFERENCES tbl_Jugador(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT uq_tbl_usuario_x_jugador UNIQUE (ID_Usuario, ID_Jugador),
    CONSTRAINT chk_tbl_usuario_x_jugador_alias_local_no_vacio CHECK (
        alias_local IS NULL OR btrim(alias_local) <> ''
    )
);

CREATE TABLE tbl_Jugador_X_Partida (
    ID integer GENERATED ALWAYS AS IDENTITY,
    ID_Jugador integer NOT NULL,
    ID_Partida integer NOT NULL,
    ID_Rol integer NOT NULL,
    ID_Campeon integer NOT NULL,
    kills integer NOT NULL,
    deaths integer NOT NULL,
    assists integer NOT NULL,
    cs integer NOT NULL,
    oro integer NOT NULL,
    danio integer NOT NULL,
    vision integer NOT NULL,
    win boolean NOT NULL,
    kda numeric(8,2) NOT NULL,
    participacion_kills numeric(6,2) NOT NULL,
    CONSTRAINT pk_tbl_jugador_x_partida PRIMARY KEY (ID),
    CONSTRAINT fk_tbl_jugador_x_partida_jugador FOREIGN KEY (ID_Jugador)
        REFERENCES tbl_Jugador(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_tbl_jugador_x_partida_partida FOREIGN KEY (ID_Partida)
        REFERENCES tbl_Partida(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_tbl_jugador_x_partida_rol FOREIGN KEY (ID_Rol)
        REFERENCES tbl_Rol(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_tbl_jugador_x_partida_campeon FOREIGN KEY (ID_Campeon)
        REFERENCES tbl_Campeon(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_tbl_jugador_x_partida UNIQUE (ID_Jugador, ID_Partida),
    CONSTRAINT chk_tbl_jugador_x_partida_kills CHECK (kills >= 0),
    CONSTRAINT chk_tbl_jugador_x_partida_deaths CHECK (deaths >= 0),
    CONSTRAINT chk_tbl_jugador_x_partida_assists CHECK (assists >= 0),
    CONSTRAINT chk_tbl_jugador_x_partida_cs CHECK (cs >= 0),
    CONSTRAINT chk_tbl_jugador_x_partida_oro CHECK (oro >= 0),
    CONSTRAINT chk_tbl_jugador_x_partida_danio CHECK (danio >= 0),
    CONSTRAINT chk_tbl_jugador_x_partida_vision CHECK (vision >= 0),
    CONSTRAINT chk_tbl_jugador_x_partida_kda CHECK (kda >= 0),
    CONSTRAINT chk_tbl_jugador_x_partida_pkills CHECK (participacion_kills >= 0 AND participacion_kills <= 100)
);

CREATE TABLE tbl_Comparacion_X_Jugador (
    ID integer GENERATED ALWAYS AS IDENTITY,
    ID_Comparacion integer NOT NULL,
    ID_Jugador integer NOT NULL,
    tipo_participante varchar(20) NOT NULL,
    puntaje_final numeric(8,2) NOT NULL,
    CONSTRAINT pk_tbl_comparacion_x_jugador PRIMARY KEY (ID),
    CONSTRAINT fk_tbl_comparacion_x_jugador_comparacion FOREIGN KEY (ID_Comparacion)
        REFERENCES tbl_Comparacion(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_tbl_comparacion_x_jugador_jugador FOREIGN KEY (ID_Jugador)
        REFERENCES tbl_Jugador(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_tbl_comparacion_x_jugador UNIQUE (ID_Comparacion, ID_Jugador),
    CONSTRAINT chk_tbl_comparacion_x_jugador_tipo CHECK (
        btrim(tipo_participante) <> '' AND
        lower(tipo_participante) IN ('usuario','compañero','companero','rival','otro')
    ),
    CONSTRAINT chk_tbl_comparacion_x_jugador_puntaje CHECK (puntaje_final >= 0)
);

CREATE TABLE tbl_Comparacion_X_Metrica (
    ID integer GENERATED ALWAYS AS IDENTITY,
    ID_Comparacion integer NOT NULL,
    ID_Metrica integer NOT NULL,
    valor_jugador_1 numeric(10,2) NOT NULL,
    valor_jugador_2 numeric(10,2) NOT NULL,
    ganador_metrica varchar(20),
    peso_aplicado numeric(6,2) NOT NULL,
    CONSTRAINT pk_tbl_comparacion_x_metrica PRIMARY KEY (ID),
    CONSTRAINT fk_tbl_comparacion_x_metrica_comparacion FOREIGN KEY (ID_Comparacion)
        REFERENCES tbl_Comparacion(ID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_tbl_comparacion_x_metrica_metrica FOREIGN KEY (ID_Metrica)
        REFERENCES tbl_Metrica(ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_tbl_comparacion_x_metrica UNIQUE (ID_Comparacion, ID_Metrica),
    CONSTRAINT chk_tbl_comparacion_x_metrica_peso CHECK (peso_aplicado >= 0 AND peso_aplicado <= 100),
    CONSTRAINT chk_tbl_comparacion_x_metrica_ganador CHECK (
        ganador_metrica IS NULL OR
        lower(ganador_metrica) IN ('jugador_1','jugador_2','empate')
    )
);

CREATE OR REPLACE FUNCTION fn_capitalizar_texto(valor text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    IF valor IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN initcap(btrim(valor));
END;
$$;

CREATE OR REPLACE FUNCTION fn_normalizar_usuario()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.email := lower(btrim(NEW.email));
    NEW.nombre := fn_capitalizar_texto(NEW.nombre);
    NEW.google_uid := btrim(NEW.google_uid);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_normalizar_jugador()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.puuid := btrim(NEW.puuid);
    NEW.game_name := btrim(NEW.game_name);
    NEW.tag_line := upper(btrim(NEW.tag_line));
    NEW.region := upper(btrim(NEW.region));
    IF NEW.rango_actual IS NOT NULL THEN
        NEW.rango_actual := fn_capitalizar_texto(NEW.rango_actual);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_normalizar_catalogos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.nombre := fn_capitalizar_texto(NEW.nombre);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_normalizar_usuario_x_jugador()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.alias_local IS NOT NULL THEN
        NEW.alias_local := fn_capitalizar_texto(NEW.alias_local);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_normalizar_comparacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.titulo := fn_capitalizar_texto(NEW.titulo);
    NEW.rol_evaluado := fn_capitalizar_texto(NEW.rol_evaluado);
    IF NEW.resultado_final IS NOT NULL THEN
        NEW.resultado_final := fn_capitalizar_texto(NEW.resultado_final);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_normalizar_comparacion_x_jugador()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.tipo_participante := lower(btrim(NEW.tipo_participante));
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_normalizar_comparacion_x_metrica()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.ganador_metrica IS NOT NULL THEN
        NEW.ganador_metrica := lower(btrim(NEW.ganador_metrica));
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tbl_usuario_normalizar
BEFORE INSERT OR UPDATE ON tbl_Usuario
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_usuario();

CREATE TRIGGER trg_tbl_jugador_normalizar
BEFORE INSERT OR UPDATE ON tbl_Jugador
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_jugador();

CREATE TRIGGER trg_tbl_estado_normalizar
BEFORE INSERT OR UPDATE ON tbl_Estado
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_catalogos();

CREATE TRIGGER trg_tbl_rol_normalizar
BEFORE INSERT OR UPDATE ON tbl_Rol
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_catalogos();

CREATE TRIGGER trg_tbl_campeon_normalizar
BEFORE INSERT OR UPDATE ON tbl_Campeon
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_catalogos();

CREATE TRIGGER trg_tbl_metrica_normalizar
BEFORE INSERT OR UPDATE ON tbl_Metrica
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_catalogos();

CREATE TRIGGER trg_tbl_usuario_x_jugador_normalizar
BEFORE INSERT OR UPDATE ON tbl_Usuario_X_Jugador
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_usuario_x_jugador();

CREATE TRIGGER trg_tbl_comparacion_normalizar
BEFORE INSERT OR UPDATE ON tbl_Comparacion
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_comparacion();

CREATE TRIGGER trg_tbl_comparacion_x_jugador_normalizar
BEFORE INSERT OR UPDATE ON tbl_Comparacion_X_Jugador
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_comparacion_x_jugador();

CREATE TRIGGER trg_tbl_comparacion_x_metrica_normalizar
BEFORE INSERT OR UPDATE ON tbl_Comparacion_X_Metrica
FOR EACH ROW
EXECUTE FUNCTION fn_normalizar_comparacion_x_metrica();

COMMIT;