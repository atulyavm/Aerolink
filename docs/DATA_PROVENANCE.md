# Data provenance register

| Item                      | Source                                    | Coverage / CRS                        | Time                            | Use / attribution                                       | Limitations                                             |
| ------------------------- | ----------------------------------------- | ------------------------------------- | ------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| Background map            | OpenStreetMap standard tile server        | Wayanad viewport; EPSG:3857 tiles     | Provider managed                | © OpenStreetMap contributors; ODbL data and tile policy | Internet required; not live road status                 |
| Settlement anchors        | Authored approximate named-place fixtures | Southern Wayanad; EPSG:4326 lat/lon   | Static UI fixture               | Project demonstration                                   | Not surveyed, no population or official boundary claims |
| Rainfall                  | Authored fixture values                   | Selected anchors; no station coverage | Fictional 10 June 2026 scenario | Project demonstration                                   | Not Open-Meteo historical or live observations          |
| Terrain / concern circles | Authored illustrative fixture             | Selected anchors; EPSG:4326 centers   | Static                          | Project demonstration                                   | Not GSI data, not validated susceptibility              |
| Roads / candidate lines   | Authored schematic R17 and R22 polylines  | Meppadi–Mundakkai demo corridor       | Scenario checkpoint state       | Project demonstration                                   | Not an OSM extraction; no vehicle/direction constraints |
| Reports / emergencies     | Fictional observations                    | Named demo settlements                | Scenario clock, IST             | No real personal records                                | No actual emergency; extraction fields are seeded       |
| Confidence / priorities   | Explicit scenario labels and selectors    | Declared demo only                    | Scenario checkpoint             | Project demonstration                                   | Not validated probabilities or operational rules        |

Future real sources need provider identifiers, coverage, CRS, source/event/received times, permitted use, attribution and limitations before replacing these fixtures.
