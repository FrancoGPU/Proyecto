--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-0+deb12u2)
-- Dumped by pg_dump version 15.12 (Debian 15.12-0+deb12u2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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


ALTER TABLE public.combos_id_seq OWNER TO postgres;

--
-- Name: combos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.combos_id_seq OWNED BY public.combos.id;


--
-- Name: dulceria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dulceria (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    precio numeric(6,2) NOT NULL,
    imagen character varying(255)
);


ALTER TABLE public.dulceria OWNER TO postgres;

--
-- Name: dulceria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dulceria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dulceria_id_seq OWNER TO postgres;

--
-- Name: dulceria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dulceria_id_seq OWNED BY public.dulceria.id;


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


ALTER TABLE public.movies_id_seq OWNER TO postgres;

--
-- Name: movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movies_id_seq OWNED BY public.movies.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: productos_individuales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos_individuales (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image character varying(255)
);


ALTER TABLE public.productos_individuales OWNER TO postgres;

--
-- Name: productos_individuales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_individuales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.productos_individuales_id_seq OWNER TO postgres;

--
-- Name: productos_individuales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_individuales_id_seq OWNED BY public.productos_individuales.id;


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


ALTER TABLE public.upcoming_movies_id_seq OWNER TO postgres;

--
-- Name: upcoming_movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.upcoming_movies_id_seq OWNED BY public.upcoming_movies.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'usuario'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    recovery_token character varying(255),
    recovery_token_expires_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: combos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combos ALTER COLUMN id SET DEFAULT nextval('public.combos_id_seq'::regclass);


--
-- Name: dulceria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dulceria ALTER COLUMN id SET DEFAULT nextval('public.dulceria_id_seq'::regclass);


--
-- Name: movies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies ALTER COLUMN id SET DEFAULT nextval('public.movies_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: productos_individuales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_individuales ALTER COLUMN id SET DEFAULT nextval('public.productos_individuales_id_seq'::regclass);


--
-- Name: upcoming_movies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upcoming_movies ALTER COLUMN id SET DEFAULT nextval('public.upcoming_movies_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: combos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.combos (id, name, description, price, image) FROM stdin;
1	Combo 1	Palomitas + Refresco	14.99	/assets/images/combo1.png
2	Combo 2	2 Palomitas + 2 Refrescos	22.99	/assets/images/combo2.png
3	Combo 3	Palomitas + 2 Refrescos + Nachos	17.99	/assets/images/combo3.png
\.


--
-- Data for Name: dulceria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dulceria (id, nombre, descripcion, precio, imagen) FROM stdin;
1	Gaseosa	Pepsi	7.00	https://th.bing.com/th/id/OIP.dM-bxtkbM_yF-FFhbvaF2wHaE8?r=0&rs=1&pid=ImgDetMain
2	Gaseosa	cocacola	8.00	https://th.bing.com/th/id/OIP.dM-bxtkbM_yF-FFhbvaF2wHaE8?r=0&rs=1&pid=ImgDetMain
3	Gaseosa	Inkacola	8.00	https://th.bing.com/th/id/OIP.dM-bxtkbM_yF-FFhbvaF2wHaE8?r=0&rs=1&pid=ImgDetMain
4	Gaseosa	Fanta	8.00	https://th.bing.com/th/id/OIP.dM-bxtkbM_yF-FFhbvaF2wHaE8?r=0&rs=1&pid=ImgDetMain
\.


--
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movies (id, title, genre, release_date, description, image, showtimes) FROM stdin;
1	El Origen	Ciencia Ficción	2010-07-16	Un ladrón que roba secretos corporativos.	/assets/images/Inception.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
4	The Shawshank Redemption	Drama	1994-09-23	Un banquero injustamente encarcelado encuentra esperanza y amistad en prisión.	/assets/images/Shawshank.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
5	Pulp Fiction	Crimen / Drama	1994-10-14	Historias entrelazadas de crimen y redención en Los Ángeles.	/assets/images/pulp-fiction.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
6	Forrest Gump	Drama / Romance	1994-07-06	La extraordinaria vida de Forrest Gump, un hombre con un gran corazón y una vida llena de aventuras.	/assets/images/Forrest-Gump.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
7	Mickey 17	Ciencia Ficción	2025-03-29	Un hombre es enviado en una misión suicida a un planeta helado, donde descubre los límites de la supervivencia humana.	/assets/images/mickey17.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
8	Betterman	Drama / Misterio	2024-11-10	Un hombre busca redimirse enfrentando su pasado y resolviendo un misterio que cambiará su vida.	/assets/images/betterman.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
10	Memorias de un Caracol	Animación / Fantasía	2023-06-15	Un caracol emprende un viaje mágico para descubrir el valor de la memoria y la amistad.	/assets/images/memorias-de-un-caracol.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
3	Dark Knight	Acción	2024-01-01	Una noche oscura llena de acción.	/assets/images/dark-knight.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
9	Nosferatu	Terror	2024-12-25	Nosferatu es una historia gótica de obsesión entre una joven atormentada y el aterrador vampiro enamorado de ella, causando un horror indescriptible a su paso.	/assets/images/nosferatu.jpeg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
11	Flow	Drama/Fantasía	2024-05-15	la historia de un gato negro que se despierta en un mundo inundado, donde la humanidad ha desaparecido. A lo largo de su travesía, el gato se une a un grupo de animales que deben aprender a convivir y superar sus diferencias para sobrevivir en este nuevo entorno.	/assets/images/flow.jpeg	{"11:00 AM","2:00 PM","5:00 PM","8:00 PM"}
12	Operación Venganza	Acción/Thriller	2025-04-01	Un amateur se embarca en una peligrosa misión de venganza. Protagonizada por Rami Malek y Laurence Fishburne.	/assets/images/operacionvenganza.jpeg	{"1:00 PM","4:00 PM","7:00 PM","10:00 PM"}
13	The Brutalist	Drama	2024-03-20	Aclamada como "una gran obra maestra americana", ganadora de 3 Globos de Oro incluyendo Mejor Película.	/assets/images/thebrutalist.jpeg	{"12:30 PM","3:30 PM","6:30 PM","9:30 PM"}
14	El Camino: A Breaking Bad Movie	Drama/Crimen	2019-10-11	Secuela de Breaking Bad que sigue a Jesse Pinkman después de los eventos de la serie.	/assets/images/el-camino.jpg	{"2:00 PM","5:00 PM","8:00 PM","11:00 PM"}
15	Dune: Part Two	Ciencia Ficción	2024-03-01	Segunda parte de la épica adaptación de la novela de Frank Herbert, dirigida por Denis Villeneuve.	/assets/images/dune2.jpg	{"1:30 PM","4:30 PM","7:30 PM","10:30 PM"}
16	The Bikeriders	Drama	2024-06-21	Historia de un club de motociclistas en los años 60, con Austin Butler y Jodie Comer.	/assets/images/bikeriders.jpg	{"12:15 PM","3:15 PM","6:15 PM","9:15 PM"}
2	Coraline	Animacion / Drama	2010-12-15	Coraline Jones explora un mundo alternativo siniestro donde sus "Otros Padres" tienen botones por ojos.	/assets/images/Coraline.jpg	{"12:00 PM","3:00 PM","6:00 PM","9:00 PM"}
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, email, token, expires_at) FROM stdin;
\.


--
-- Data for Name: productos_individuales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos_individuales (id, name, description, price, image) FROM stdin;
1	Cancha Grande	Porción grande de canchita recién hecha.	15.00	/img/dulceria/cancha_grande.jpg
2	Gaseosa Mediana	Tu gaseosa favorita en tamaño mediano.	8.00	/img/dulceria/gaseosa_mediana.jpg
3	Hot Dog Clásico	Delicioso hot dog con tus cremas preferidas.	10.00	/img/dulceria/hot_dog.jpg
4	Nachos con Queso	Crujientes nachos acompañados de queso fundido.	12.00	/img/dulceria/nachos_queso.jpg
5	Chocolate Sublime	Tableta de chocolate Sublime.	5.00	/img/dulceria/chocolate_sublime.jpg
\.


--
-- Data for Name: upcoming_movies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upcoming_movies (id, title, genre, release_date, description, image) FROM stdin;
1	Avatar 3	Ciencia Ficción	2025-12-20	La próxima entrega de la épica saga de Pandora.	../assets/images/Avatar3.jpg
2	Los Vengadores: Dinastía Kang	Acción	2026-05-01	Los héroes más poderosos de la Tierra enfrentan una nueva amenaza.	../assets/images/avengers-kang.jpg
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (sid, sess, expire) FROM stdin;
xlJYSTWIYKvP9h_vNHe7yN4ER2p6BaCm	{"cookie":{"originalMaxAge":86400000,"expires":"2025-06-06T04:27:54.906Z","secure":false,"httpOnly":true,"path":"/"},"user":{"id":1,"email":"francopaolo.garciaurbano2@gmail.com","username":"FrancoGPU","role":"admin"}}	2025-06-07 04:27:38
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, role, created_at, recovery_token, recovery_token_expires_at) FROM stdin;
1	FrancoGPU	francopaolo.garciaurbano2@gmail.com	$2b$10$XajPGacDCkQnEEyS/PhKEe175Q7aiP6RxYKhsfUUYRxQGoexPMana	admin	2025-05-19 04:18:04.110427+00	\N	\N
3	Prueba1	Prueba1@gmail.com	$2b$10$hJc3SCmYhG9Dd8jDkG0Sq.tXpW/dDj12GVpsRFyswn7bxm8JtIYUu	usuario	2025-05-23 22:49:07.357936+00	\N	\N
4	testuser	test@example.com	$2b$10$GI0erpEUZge.X.6GMTNZ4Of3hv31ahXUKUyeEPOwgbhKu0TyOaq.i	usuario	2025-06-02 05:08:03.85148+00	4a942673e381f354eb017e05007663e06d259f0a904e0751349290811b3764f6	2025-06-02 06:37:26.189
2	Prueba	Prueba@gmail.com	$2b$10$42QABQ923UruOibp.p7nCey2jc0t1iyY41Y9UMc3Z34uthc5Yi6iS	usuario	2025-05-23 05:00:10.681675+00	\N	\N
\.


--
-- Name: combos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.combos_id_seq', 7, true);


--
-- Name: dulceria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dulceria_id_seq', 4, true);


--
-- Name: movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movies_id_seq', 19, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: productos_individuales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_individuales_id_seq', 5, true);


--
-- Name: upcoming_movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.upcoming_movies_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: combos combos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combos
    ADD CONSTRAINT combos_pkey PRIMARY KEY (id);


--
-- Name: dulceria dulceria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dulceria
    ADD CONSTRAINT dulceria_pkey PRIMARY KEY (id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: productos_individuales productos_individuales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_individuales
    ADD CONSTRAINT productos_individuales_pkey PRIMARY KEY (id);


--
-- Name: upcoming_movies upcoming_movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upcoming_movies
    ADD CONSTRAINT upcoming_movies_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: IDX_user_sessions_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_sessions_expire" ON public.user_sessions USING btree (expire);


--
-- PostgreSQL database dump complete
--

