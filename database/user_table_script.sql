-- Table: public.User

-- DROP TABLE IF EXISTS public."User";

CREATE TABLE IF NOT EXISTS public."User"
(
    user_id integer NOT NULL,
    email character varying(100)[] COLLATE pg_catalog."default" NOT NULL,
    password character varying(255)[] COLLATE pg_catalog."default" NOT NULL,
    first_name character varying(100)[] COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(100)[] COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY (user_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."User"
    OWNER to postgres;