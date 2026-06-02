BEGIN;

INSERT INTO tbl_Estado (nombre)
VALUES
    ('Activo'),
    ('Inactivo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_Rol (nombre)
VALUES
    ('Top')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_Parche (version, fecha_lanzamiento)
VALUES
    ('14.10', DATE '2024-05-15'),
    ('14.11', DATE '2024-05-30')
ON CONFLICT (version) DO NOTHING;

INSERT INTO tbl_Campeon (nombre, tipo_danio, recurso)
VALUES
    ('Aatrox', 'Fisico', 'Manaless'),
    ('Camille', 'Fisico', 'Mana'),
    ('Fiora', 'Fisico', 'Mana'),
    ('Gnar', 'Mixto', 'Rage'),
    ('Gragas', 'Magico', 'Mana'),
    ('Jax', 'Mixto', 'Mana'),
    ('Kennen', 'Magico', 'Energia'),
    ('K''Sante', 'Fisico', 'Mana'),
    ('Malphite', 'Magico', 'Mana'),
    ('Ornn', 'Magico', 'Mana'),
    ('Renekton', 'Fisico', 'Furia'),
    ('Rumble', 'Magico', 'Calor'),
    ('Shen', 'Magico', 'Energia'),
    ('Sion', 'Fisico', 'Mana'),
    ('Vladimir', 'Magico', 'Vida')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_Metrica (nombre, descripcion, peso)
VALUES
    ('KDA', 'Relacion entre kills, deaths y assists del top laner', 20.00),
    ('CS', 'Capacidad de farmeo y consistencia en subditos', 20.00),
    ('Danio', 'Aporte de daño total en partida', 20.00),
    ('Vision', 'Control de visión y aporte de wards/visión', 10.00),
    ('Participacion Kills', 'Participación en asesinatos del equipo', 20.00),
    ('Oro', 'Oro total acumulado en la partida', 10.00)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tbl_Usuario (ID_Estado, google_uid, email, nombre)
SELECT e.id, 'google_user_top_001', 'oscar.toro@example.com', 'oscar toro'
FROM tbl_Estado e
WHERE e.nombre = 'Activo'
ON CONFLICT (google_uid) DO NOTHING;

INSERT INTO tbl_Jugador (ID_Estado, puuid, game_name, tag_line, region, nivel, rango_actual)
SELECT e.id, 'puuid-top-001', 'OscarTop', 'TOP', 'LA2', 250, 'diamond'
FROM tbl_Estado e
WHERE e.nombre = 'Activo'
ON CONFLICT (puuid) DO NOTHING;

INSERT INTO tbl_Jugador (ID_Estado, puuid, game_name, tag_line, region, nivel, rango_actual)
SELECT e.id, 'puuid-top-002', 'RivalTop', 'GAP', 'LA2', 230, 'emerald'
FROM tbl_Estado e
WHERE e.nombre = 'Activo'
ON CONFLICT (puuid) DO NOTHING;

INSERT INTO tbl_Usuario_X_Jugador (ID_Usuario, ID_Jugador, alias_local, fecha_asociacion)
SELECT u.id, j.id, 'main top', DATE '2026-04-28'
FROM tbl_Usuario u
JOIN tbl_Jugador j ON j.puuid = 'puuid-top-001'
WHERE u.google_uid = 'google_user_top_001'
ON CONFLICT (ID_Usuario, ID_Jugador) DO NOTHING;

INSERT INTO tbl_Partida (ID_Parche, riot_match_id, modo_juego, duracion_segundos, fecha_partida, queue_id, version_partida)
SELECT p.id, 'LA2_000000001', 'Ranked Solo/Duo', 1980, DATE '2026-04-28', '420', '14.11'
FROM tbl_Parche p
WHERE p.version = '14.11'
ON CONFLICT (riot_match_id) DO NOTHING;

INSERT INTO tbl_Comparacion (ID_Usuario, titulo, descripcion, rol_evaluado, fecha_comparacion, resultado_final, recomendacion_IA)
SELECT u.id,
       'Comparacion top lane inicial',
       'Comparacion base entre dos top laners para validar modelo',
       'Top',
       DATE '2026-04-28',
       'Pendiente',
       'Aun sin generar'
FROM tbl_Usuario u
WHERE u.google_uid = 'google_user_top_001'
ON CONFLICT DO NOTHING;

INSERT INTO tbl_Jugador_X_Partida (
    ID_Jugador, ID_Partida, ID_Rol, ID_Campeon,
    kills, deaths, assists, cs, oro, danio, vision, win, kda, participacion_kills
)
SELECT
    j.id,
    p.id,
    r.id,
    c.id,
    7, 3, 8, 210, 14500, 28000, 22, true, 5.00, 62.50
FROM tbl_Jugador j
JOIN tbl_Partida p ON p.riot_match_id = 'LA2_000000001'
JOIN tbl_Rol r ON r.nombre = 'Top'
JOIN tbl_Campeon c ON c.nombre = 'Camille'
WHERE j.puuid = 'puuid-top-001'
ON CONFLICT (ID_Jugador, ID_Partida) DO NOTHING;

INSERT INTO tbl_Jugador_X_Partida (
    ID_Jugador, ID_Partida, ID_Rol, ID_Campeon,
    kills, deaths, assists, cs, oro, danio, vision, win, kda, participacion_kills
)
SELECT
    j.id,
    p.id,
    r.id,
    c.id,
    4, 5, 6, 185, 12800, 21000, 16, false, 2.00, 45.00
FROM tbl_Jugador j
JOIN tbl_Partida p ON p.riot_match_id = 'LA2_000000001'
JOIN tbl_Rol r ON r.nombre = 'Top'
JOIN tbl_Campeon c ON c.nombre = 'Renekton'
WHERE j.puuid = 'puuid-top-002'
ON CONFLICT (ID_Jugador, ID_Partida) DO NOTHING;

INSERT INTO tbl_Comparacion_X_Jugador (ID_Comparacion, ID_Jugador, tipo_participante, puntaje_final)
SELECT c.id, j.id, 'usuario', 82.50
FROM tbl_Comparacion c
JOIN tbl_Jugador j ON j.puuid = 'puuid-top-001'
WHERE c.titulo = 'Comparacion top lane inicial'
ON CONFLICT (ID_Comparacion, ID_Jugador) DO NOTHING;

INSERT INTO tbl_Comparacion_X_Jugador (ID_Comparacion, ID_Jugador, tipo_participante, puntaje_final)
SELECT c.id, j.id, 'rival', 68.40
FROM tbl_Comparacion c
JOIN tbl_Jugador j ON j.puuid = 'puuid-top-002'
WHERE c.titulo = 'Comparacion top lane inicial'
ON CONFLICT (ID_Comparacion, ID_Jugador) DO NOTHING;

INSERT INTO tbl_Comparacion_X_Metrica (
    ID_Comparacion, ID_Metrica, valor_jugador_1, valor_jugador_2, ganador_metrica, peso_aplicado
)
SELECT c.id, m.id, 5.00, 2.00, 'jugador_1', 20.00
FROM tbl_Comparacion c
JOIN tbl_Metrica m ON m.nombre = 'KDA'
WHERE c.titulo = 'Comparacion top lane inicial'
ON CONFLICT (ID_Comparacion, ID_Metrica) DO NOTHING;

INSERT INTO tbl_Comparacion_X_Metrica (
    ID_Comparacion, ID_Metrica, valor_jugador_1, valor_jugador_2, ganador_metrica, peso_aplicado
)
SELECT c.id, m.id, 210.00, 185.00, 'jugador_1', 20.00
FROM tbl_Comparacion c
JOIN tbl_Metrica m ON m.nombre = 'CS'
WHERE c.titulo = 'Comparacion top lane inicial'
ON CONFLICT (ID_Comparacion, ID_Metrica) DO NOTHING;

INSERT INTO tbl_Comparacion_X_Metrica (
    ID_Comparacion, ID_Metrica, valor_jugador_1, valor_jugador_2, ganador_metrica, peso_aplicado
)
SELECT c.id, m.id, 28000.00, 21000.00, 'jugador_1', 20.00
FROM tbl_Comparacion c
JOIN tbl_Metrica m ON m.nombre = 'Danio'
WHERE c.titulo = 'Comparacion top lane inicial'
ON CONFLICT (ID_Comparacion, ID_Metrica) DO NOTHING;

INSERT INTO tbl_Comparacion_X_Metrica (
    ID_Comparacion, ID_Metrica, valor_jugador_1, valor_jugador_2, ganador_metrica, peso_aplicado
)
SELECT c.id, m.id, 22.00, 16.00, 'jugador_1', 10.00
FROM tbl_Comparacion c
JOIN tbl_Metrica m ON m.nombre = 'Vision'
WHERE c.titulo = 'Comparacion top lane inicial'
ON CONFLICT (ID_Comparacion, ID_Metrica) DO NOTHING;

INSERT INTO tbl_Comparacion_X_Metrica (
    ID_Comparacion, ID_Metrica, valor_jugador_1, valor_jugador_2, ganador_metrica, peso_aplicado
)
SELECT c.id, m.id, 62.50, 45.00, 'jugador_1', 20.00
FROM tbl_Comparacion c
JOIN tbl_Metrica m ON m.nombre = 'Participacion Kills'
WHERE c.titulo = 'Comparacion top lane inicial'
ON CONFLICT (ID_Comparacion, ID_Metrica) DO NOTHING;

INSERT INTO tbl_Comparacion_X_Metrica (
    ID_Comparacion, ID_Metrica, valor_jugador_1, valor_jugador_2, ganador_metrica, peso_aplicado
)
SELECT c.id, m.id, 14500.00, 12800.00, 'jugador_1', 10.00
FROM tbl_Comparacion c
JOIN tbl_Metrica m ON m.nombre = 'Oro'
WHERE c.titulo = 'Comparacion top lane inicial'
ON CONFLICT (ID_Comparacion, ID_Metrica) DO NOTHING;

COMMIT;