-- Table: public.Buildings

-- DROP TABLE IF EXISTS public."Buildings";

CREATE TABLE IF NOT EXISTS public."Buildings"
(
    building_id integer NOT NULL,
    has_food boolean NOT NULL,
    building_name character varying(100)[] COLLATE pg_catalog."default" NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    opening_hours character varying(50)[] COLLATE pg_catalog."default" NOT NULL,
    building_description character varying(200) COLLATE pg_catalog."default" NOT NULL,
    accessible boolean NOT NULL,
    CONSTRAINT "Buildings_pkey" PRIMARY KEY (building_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Buildings"
    OWNER to postgres;