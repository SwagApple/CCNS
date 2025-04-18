-- Table: public.Location Logs

-- DROP TABLE IF EXISTS public."Location Logs";

CREATE TABLE IF NOT EXISTS public."Location Logs"
(
    log_id integer NOT NULL,
    user_id integer NOT NULL,
    "latitude " double precision NOT NULL,
    longitude double precision NOT NULL,
    CONSTRAINT "Location Logs_pkey" PRIMARY KEY (log_id),
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public."User" (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Location Logs"
    OWNER to postgres;