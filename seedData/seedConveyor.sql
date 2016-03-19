\c robodb;

-- TRUNCATE TABLE programCards;
CREATE TABLE conveyorBelt (
  id SERIAL PRIMARY KEY,
  type TEXT,
  magnitude INTEGER,
  destination TEXT
);


INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('straight', 1, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('straight', 1, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('straight', 1, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('straight', 1, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('straight', 2, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('straight', 2, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('straight', 2, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('straight', 2, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('clockwise', 1, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('clockwise', 1, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('clockwise', 1, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('clockwise', 1, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('clockwise', 2, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('clockwise', 2, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('clockwise', 2, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('clockwise', 2, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('counterclock', 1, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('counterclock', 1, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('counterclock', 1, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('counterclock', 1, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('counterclock', 2, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('counterclock', 2, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('counterclock', 2, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('counterclock', 2, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1left', 1, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1left', 1, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1left', 1, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1left', 1, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1left', 2, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1left', 2, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1left', 2, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1left', 2, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1right', 1, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1right', 1, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1right', 1, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1right', 1, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1right', 2, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1right', 2, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1right', 2, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge1right', 2, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge2', 1, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge2', 1, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge2', 1, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge2', 1, 'W');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge2', 2, 'N');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge2', 2, 'E');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge2', 2, 'S');
INSERT INTO conveyorBelt (type, magnitude, destination) VALUES ('merge2', 2, 'W');
