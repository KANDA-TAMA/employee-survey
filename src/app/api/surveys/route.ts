import { NextRequest, NextResponse } from 'next/server';
import { getSurveys, getSurveyById, createSurvey, updateSurvey, deleteSurvey } from '@/lib/googleSheets';
import { SurveyFormData } from '@/lib/types';

// GET: アンケート一覧取得 または 特定のアンケート取得
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const activeOnly = searchParams.get('activeOnly') === 'true';

        if (id) {
            const survey = await getSurveyById(id);
            if (!survey) {
                return NextResponse.json(
                    { success: false, error: 'Survey not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, data: survey });
        }

        let surveys = await getSurveys();

        if (activeOnly) {
            surveys = surveys.filter((s) => s.isActive);
        }

        return NextResponse.json({ success: true, data: surveys });
    } catch (error) {
        console.error('Error in GET /api/surveys:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch surveys' },
            { status: 500 }
        );
    }
}

// POST: 新規アンケート作成
export async function POST(request: NextRequest) {
    try {
        const body: SurveyFormData = await request.json();

        if (!body.title || !body.questions || body.questions.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Title and at least one question are required' },
                { status: 400 }
            );
        }

        const survey = await createSurvey({
            title: body.title,
            description: body.description || '',
            questions: body.questions,
            isActive: true,
        });

        return NextResponse.json({ success: true, data: survey }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/surveys:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to create survey' },
            { status: 500 }
        );
    }
}

// PUT: アンケート更新
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Survey ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const survey = await updateSurvey(id, body);

        if (!survey) {
            return NextResponse.json(
                { success: false, error: 'Survey not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: survey });
    } catch (error) {
        console.error('Error in PUT /api/surveys:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update survey' },
            { status: 500 }
        );
    }
}

// DELETE: アンケート削除（論理削除）
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Survey ID is required' },
                { status: 400 }
            );
        }

        const success = await deleteSurvey(id);

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Survey not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/surveys:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete survey' },
            { status: 500 }
        );
    }
}
