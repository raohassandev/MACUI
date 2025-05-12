
✅ New Development Task

8. Redirect to Widget Configuration Page on "Add New Widget"



When the engineer clicks "Add New Widget", navigate to a dedicated configuration page (/dashboard/widget/new or similar).

On this page:

Let the user select the widget type (Chart, Gauge, Numeric, etc.).

Display all configuration options: tag binding, title, units, display settings, thresholds, styling, etc.

Use a preview/live-update view of the widget based on the settings.


After the user clicks "Save":

Return to the main dashboard page.

Automatically add the newly configured widget to the dashboard's current layout (using dashboardSlice and widgetsSlice).

The new widget should now be resizable and draggable like others.


Use Redux state or a temporary in-memory store to pass unsaved widget config if needed.


> Do not change or affect existing widgets or layout behavior. Only handle the flow for adding new widgets.

