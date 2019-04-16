from tethys_sdk.base import TethysAppBase, url_map_maker
from tethys_sdk.app_settings import CustomSetting


class YaqueDelNorteViewer(TethysAppBase):
    """
    Tethys app class for Yaque Del Norte Viewer.
    """

    name = 'Yaque Del Norte Viewer'
    index = 'yaque_del_norte_viewer:home'
    icon = 'yaque_del_norte_viewer/images/flood-io-logo-png-transparent.png'
    package = 'yaque_del_norte_viewer'
    root_url = 'yaque-del-norte-viewer'
    color = '#524f4f'
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
            UrlMap(
                name='damage_report_ajax',
                url='damage_report_ajax',
                controller='yaque_del_norte_viewer.controllers.damage_report_ajax'
            ),
            UrlMap(
                name='is_flooded_check',
                url='is_flooded_check',
                controller='yaque_del_norte_viewer.controllers.is_flooded_check'
            ),
        )

        return url_maps

    def custom_settings(self):
        return (
            CustomSetting(
                name='Database Name',
                type=CustomSetting.TYPE_STRING,
                description='The name of the database containing the land use shapefile.',
                required=True
            ),
            CustomSetting(
                name='Database IP',
                type=CustomSetting.TYPE_STRING,
                description='The IP address of the database.',
                required=True
            ),
            CustomSetting(
                name='Database Port',
                type=CustomSetting.TYPE_INTEGER,
                description='The port of the database containing the land use shapefile.',
                required=True
            ),
            CustomSetting(
                name='Database Username',
                type=CustomSetting.TYPE_STRING,
                description='The name of the database user.',
                required=True
            ),
            CustomSetting(
                name='Database Password',
                type=CustomSetting.TYPE_STRING,
                description='The password of the database user.',
                required=True
            ),
        )
