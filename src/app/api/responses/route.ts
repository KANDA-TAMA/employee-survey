import { NextRequest, NextResponse } from 'next/server';
import { getResponses, createResponse, getSurveyById } from '@/lib/googleSheets';
import { ResponseFormData } from '@/lib/types';

// GET: 回答一覧取得
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const surveyId = searchParams.get('surveyId');

        const responses = await getResponses(surveyId || undefined);

        return NextResponse.json({ success: true, data: responses });
    } catch (error) {
        console.error('Error in GET /api/responses:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch responses' },
            { status: 500 }
        );
    }
}

// POST: 回答を送信
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const surveyId = searchParams.get('surveyId');

        if (!surveyId) {
            return NextResponse.json(
                { success: false, error: 'Survey ID is required' },
                { status: 400 }
            );
        }

        // アンケートの存在確認
        const survey = await getSurveyById(surveyId);
        if (!survey) {
            return NextResponse.json(
                { success: false, error: 'Survey not found' },
                { status: 404 }
            );
        }

        if (!survey.isActive) {
            return NextResponse.json(
                { success: false, error: 'This survey is no longer active' },
                { status: 400 }
            );
        }

        const body: ResponseFormData = await request.json();

        if (!body.respondentName || !body.answers) {
            return NextResponse.json(
                { success: false, error: 'Respondent name and answers are required' },
                { status: 400 }
            );
        }

        // 必須質問のチェック
        const requiredQuestions = survey.questions.filter((q) => q.required);
        for (const question of requiredQuestions) {
            const answer = body.answers.find((a) => a.questionId === question.id);
            if (!answer || !answer.value || (Array.isArray(answer.value) && answer.value.length === 0)) {
                return NextResponse.json(
                    { success: false, error: `回答が必要です: ${question.text}` },
                    { status: 400 }
                );
            }
        }

        const response = await createResponse({
            surveyId,
            respondentName: body.respondentName,
            answers: body.answers,
        });

        return NextResponse.json({ success: true, data: response }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/responses:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit response' },
            { status: 500 }
        );
    }
}
