--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

DROP TABLE IF EXISTS public.combos CASCADE;
DROP TABLE IF EXISTS public.movies CASCADE;
DROP TABLE IF EXISTS public.upcoming_movies CASCADE;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: combos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.combos (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2),
    image character varying(255)
);


ALTER TABLE public.combos OWNER TO postgres;

--
-- Name: combos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.combos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.combos_id_seq OWNER TO postgres;

--
-- Name: combos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.combos_id_seq OWNED BY public.combos.id;


--
-- Name: movies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movies (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    genre character varying(100),
    release_date date,
    description text,
    image character varying(255),
    showtimes text[]
);


ALTER TABLE public.movies OWNER TO postgres;

--
-- Name: movies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movies_id_seq OWNER TO postgres;

--
-- Name: movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movies_id_seq OWNED BY public.movies.id;


--
-- Name: upcoming_movies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upcoming_movies (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    genre character varying(100),
    release_date date,
    description text,
    image character varying(255)
);


ALTER TABLE public.upcoming_movies OWNER TO postgres;

--
-- Name: upcoming_movies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.upcoming_movies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upcoming_movies_id_seq OWNER TO postgres;

--
-- Name: upcoming_movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.upcoming_movies_id_seq OWNED BY public.upcoming_movies.id;


--
-- Name: combos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combos ALTER COLUMN id SET DEFAULT nextval('public.combos_id_seq'::regclass);


--
-- Name: movies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies ALTER COLUMN id SET DEFAULT nextval('public.movies_id_seq'::regclass);


--
-- Name: upcoming_movies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upcoming_movies ALTER COLUMN id SET DEFAULT nextval('public.upcoming_movies_id_seq'::regclass);


--
-- Data for Name: combos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.combos (id, name, description, price, image) FROM stdin;
1	Combo 1	Palomitas grandes + Refresco grande	10.99	../assets/images/combo1.png
2	Combo 2	Palomitas medianas + Refresco mediano + Nachos	12.99	../assets/images/combo2.png
3	Combo 3	Palomitas pequeñas + Refresco pequeño	8.99	../assets/images/combo3.png
\.


--
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movies (id, title, genre, release_date, description, image, showtimes) FROM stdin;
1	El Origen	Ciencia Ficción	2010-07-16	Un ladrón que roba secretos corporativos.	/assets/images/Inception.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
2	Coraline	Animacion / Drama	2010-12-15	Coralinexd	/assets/images/Coraline.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
\.


--
-- Data for Name: upcoming_movies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upcoming_movies (id, title, genre, release_date, description, image) FROM stdin;
1	Avatar 3	Ciencia Ficción	2025-12-20	La próxima entrega de la épica saga de Pandora.	../assets/images/Avatar3.jpg
2	Los Vengadores: Dinastía Kang	Acción	2026-05-01	Los héroes más poderosos de la Tierra enfrentan una nueva amenaza.	../assets/images/avengers-kang.jpg
\.


--
-- Name: combos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.combos_id_seq', 3, true);


--
-- Name: movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movies_id_seq', 1, true);


--
-- Name: upcoming_movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.upcoming_movies_id_seq', 2, true);


--
-- Name: combos combos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combos
    ADD CONSTRAINT combos_pkey PRIMARY KEY (id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: upcoming_movies upcoming_movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upcoming_movies
    ADD CONSTRAINT upcoming_movies_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

