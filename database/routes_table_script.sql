-- Table: public.Routes

-- DROP TABLE IF EXISTS public."Routes";

CREATE TABLE IF NOT EXISTS public."Routes"
(
    route_id integer NOT NULL,
    start_point_id integer NOT NULL,
    end_point_id integer NOT NULL,
    estimated_time integer NOT NULL,
    CONSTRAINT "Routes_pkey" PRIMARY KEY (route_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Routes"
    OWNER to postgres;