from tethys_sdk.base import TethysAppBase, url_map_maker


class YaqueDelNorteViewer(TethysAppBase):
    """
    Tethys app class for Yaque Del Norte Viewer.
    """

    name = 'Yaque Del Norte Viewer'
    index = 'yaque_del_norte_viewer:home'
    icon = 'yaque_del_norte_viewer/images/icon.gif'
    package = 'yaque_del_norte_viewer'
    root_url = 'yaque-del-norte-viewer'
    color = '#27ae60'
    description = 'Place a brief description of your app here.'
    tags = ''
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='yaque-del-norte-viewer',
                controller='yaque_del_norte_viewer.controllers.home'
            ),
        )

        return url_maps
