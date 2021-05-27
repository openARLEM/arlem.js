# arlem.js
## A JSON validator for checking ARLEM (IEEE-SA p1589-2020) compliance

### Erik Isaksson (UCD, KTH), Fridolin Wild (OU), Abbas Jafari (OU)

This project implements a set of test routines and a web user interface for evaluating whether submitted activity and workplace models are in compliance with P1589-2020, the IEEE standard for Augented Reality Learning Experience Models. The test routines consist of JSON syntax validation, validation using JSON schemas for activity and workplace models, and cross-reference checks. The web user interface also offers editing functionality for both activity and workplace models, including live validation and form-based editing according to the schemas.

The web app is also hosted on GitHub pages and can be tested [here](https://openarlem.github.io/arlem.js/app.html).

The app is also directly integrated into the [Moodle ARLEM repository plugin](https://github.com/ARETEedu/moodle-ARLEM_repository), there providing editing facilities for stored ARLEM content archives.
