from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tethys_sdk.gizmos import Button, TableView, MessageBox

@login_required()
def home(request):
    """
    Controller for the app home page.
    """
    dmg_button = Button(
        display_text='View Forecasted Damage Report',
        name='damage-button',

        attributes={
            'onclick': 'app.show_dmg()'
            # 'data-toggle': 'tooltip',
            # 'data-placement': 'top',
            # 'title': 'Calculate Path',
            # 'onclick':'app.calculate()'

        },
    )

    message_box = MessageBox(name='sampleModal',
                             title='Resumen de Entradas',
                             message='',
                             dismiss_button='Regresar',
                             affirmative_button='Proceder',
                             width=400,
                             affirmative_attributes='href=javascript:void(0);',
                             )

    table_view = TableView(column_names=('Name', 'Age', 'Job'),
                           rows=[('Bill', 30, 'contractor'),
                                 ('Fred', 18, 'programmer'),
                                 ('Bob', 26, 'boss')],
                           hover=True,
                           striped=False,
                           bordered=False,
                           condensed=False)

    save_button = Button(
        display_text='',
        name='save-button',
        icon='glyphicon glyphicon-floppy-disk',
        style='success',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Save'
        }
    )

    edit_button = Button(
        display_text='',
        name='edit-button',
        icon='glyphicon glyphicon-edit',
        style='warning',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Edit'
        }
    )

    remove_button = Button(
        display_text='',
        name='remove-button',
        icon='glyphicon glyphicon-remove',
        style='danger',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Remove'
        }
    )

    previous_button = Button(
        display_text='Previous',
        name='previous-button',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Previous'
        }
    )

    next_button = Button(
        display_text='Next',
        name='next-button',
        attributes={
            'data-toggle':'tooltip',
            'data-placement':'top',
            'title':'Next'
        }
    )

    context = {
        'dmg_button': dmg_button,
        'message_box': message_box,
        'table_view': table_view,
        'save_button': save_button,
        'edit_button': edit_button,
        'remove_button': remove_button,
        'previous_button': previous_button,
        'next_button': next_button
    }

    return render(request, 'yaque_del_norte_viewer/home.html', context)