'use strict';

// Used to map specific panel types to be used as inputs for questions. Only certain types can be used for the forms.
type QuestionPanelTagNameMap = {
    TextEntry: TextEntry;
    Slider: Slider;
};

type QuestionPanelType = keyof QuestionPanelTagNameMap;
type QuestionPanel = QuestionPanelTagNameMap[QuestionPanelType];

interface Question {
    desc: string;
    required: boolean;
    panel: Panel;
}

class PlaytestForm {

    static formQuestions: Array<Question> = [];


    static formQuestionsPanel: Panel = $('#FormQuestions')!;
    static submitBtn: Button = $('#SubmitBtn')!;

    static onLoad() {
        const playtestForms: Record<string, Array<Record<string, any>>> = $.LoadKeyValues3File('scripts/playtest-forms.kv3') as Record<string, Array<unknown>> as Record<string, Array<Record<string, any>>>;

        $.Msg(`THE FORMS: ${JSON.stringify(playtestForms)}`);
        $.Msg('\n');
        $.Msg('\n');

        if (!playtestForms) {
            $.Warning('No valid "scripts/playtest-forms.kv3" found for this playtest!');
            return;
        }

        const forms: Array<Record<string, any>> = playtestForms['forms'];
        if (Object.keys(playtestForms).length === 0 || !playtestForms['forms']) {
            $.Warning('Couldn\'t find any forms to use for this playtest!');
            return;
        }

        const curMapName = GameInterfaceAPI.GetCurrentMap();
        if (!curMapName) {
            $.Warning('Current map is invalid to check for form!')
        }

        let i = 0;
        for (const form of forms) {

            if (Object.keys(form).length === 0) {
                $.Warning('Empty form table, ignoring...');
                continue;
            }

            $.Msg(`${i++}:\n ${JSON.stringify(form)}`);
            $.Msg('\n');

            const formMap: string = form['map'];
            if (!formMap || formMap.length === 0) {
                $.Warning('"map" KV for form is blank, invalid, or missing! Required for form to show up on specific maps!');
                continue;
            }

            if (curMapName === formMap) {

                const formQuestions = form['form_questions'] as Record<string, { key: string; value: any }>;

                for (const [i, formQuestion] of Object.values(formQuestions).entries()) {
                    const type: QuestionPanelType = formQuestion['type'];
                    if (!type) {
                        $.Warning(`Failed to create question panel for entry "${i}". Make sure the question type is specified!`);
                        continue;
                    }

                    let mainPanel: Panel = $.CreatePanel('Panel', this.formQuestionsPanel, `${formMap}_formquestion_${type}_${i}`);
                    mainPanel.LoadLayoutSnippet('FormQuestionBase');
                    let questionPanel: QuestionPanel;
                    //questionPanel.LoadLayoutSnippet(`Form${String(type)}`);

                    //const questionInputPanel: QuestionPanel = $.CreatePanel(type, questionPanel, `${formMap}_formquestion_input_${type}_${i}`)


                    switch (type) {
                        case 'TextEntry':
                            questionPanel = $.CreatePanel('TextEntry', mainPanel, 'QuestionTextEntry', {
                                class: 'textentry',
                                placeholder: formQuestion['placeholder'] ? formQuestion['placeholder'] : '[PH] Placeholder',
                                multiline: true
                            });
                            questionPanel.SetMaxChars(formQuestion['max'] ? parseInt(formQuestion['max']) : 500);
                            break;
                        case 'Slider':
                            // questionPanel = $.CreatePanel('Slider', mainPanel, 'QuestionSlider', {
                            //     class: 'slider slider--horizontal',
                            //     direction: "horizontal"
                            // });

                            mainPanel.LoadLayoutSnippet('FormQuestionSlider');
                            // questionPanel = $.CreatePanel('Panel', mainPanel, 'QuestionSlider');
                            questionPanel = mainPanel.FindChildTraverse('Slider') as Slider;

                            questionPanel.min = formQuestion['min'] ? parseFloat(formQuestion['min']) : 0;
                            questionPanel.max = formQuestion['max'] ? parseFloat(formQuestion['max']) : 10;
                            questionPanel.default = formQuestion['default'] ? parseFloat(formQuestion['default']) : 5;
                            questionPanel.showdefault = formQuestion['show_default'] ? (formQuestion['show_default'] == "true" ? true : false) : false;
                            questionPanel.value = questionPanel.default;
                            questionPanel.increment = formQuestion['snapping_increment_amt'] ? parseFloat(formQuestion['snapping_increment_amt']) : 1;
                            questionPanel.snaptoincrement = formQuestion['snapping'] ? (formQuestion['snapping'] == "true" ? true : false) : false;
                            break;
                        default:
                            $.Warning(`Invalid question entry type given for entry ${i}! Check if it is typed correctly...`);
                            continue;
                    }

                    mainPanel.SetDialogVariable('desc', formQuestion['desc'] ? formQuestion['desc'] : "[PH] Question Description");
                    const required: boolean = formQuestion['required'] ? (formQuestion['required'] == "true" ? true : false) : false;
                    if (required) {
                        mainPanel.FindChildTraverse('RequiredMark')!.visible = true;
                    }

                    this.formQuestions.push(
                        {
                            desc: formQuestion['desc'],
                            required: required,
                            panel: mainPanel
                        }
                    );

                    $.Msg(`question: ${JSON.stringify(formQuestion)}`);
                    $.Msg(`type: ${JSON.stringify(formQuestion['type'])}`);

                }

                break;
            }
        }
    }

    static onClose() {
        this.formQuestions.forEach(question => {
            question.panel.RemoveAndDeleteChildren();
        });

        this.formQuestions = [];

        UiToolkitAPI.CloseAllVisiblePopups();
    }
}