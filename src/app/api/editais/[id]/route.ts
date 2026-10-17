import { NextResponse } from 'next/server';
import { z } from 'zod';
import { canMove } from '@/features/operator-board/server';
import { KANBAN_STAGES } from '@/shared/types/domain';
import { editaisStore } from '../_store';

const bodySchema = z.object({ stage: z.enum(KANBAN_STAGES) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ reason: 'Etapa inválida.' }, { status: 400 });

  const record = editaisStore.find((e) => e.id === id);
  if (!record) return NextResponse.json({ reason: 'Edital não encontrado.' }, { status: 404 });

  // A regra roda de novo no servidor: nunca confie só na validação do cliente.
  const check = canMove(record, parsed.data.stage);
  if (!check.ok) return NextResponse.json({ reason: check.reason }, { status: 422 });

  record.stage = parsed.data.stage;
  return NextResponse.json(record);
}
