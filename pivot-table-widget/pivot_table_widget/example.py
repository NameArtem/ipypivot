import ipywidgets as widgets
from traitlets import Unicode, Float, Dict

@widgets.register
class PivotTable(widgets.DOMWidget):
    """An example widget."""
    _view_name = Unicode('PivotView').tag(sync=True)
    _model_name = Unicode('PivotModel').tag(sync=True)
    _view_module = Unicode('pivot-table-widget').tag(sync=True)
    _model_module = Unicode('pivot-table-widget').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)
    value = Unicode('Hello World!!!').tag(sync=True)
    # data_x = List([]).tag(sync=True)
    # data_y = List([]).tag(sync=True)
    # time = List([]).tag(sync=True)
    config = Dict([]).tag(sync=True)



