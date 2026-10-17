import { NextResponse } from 'next/server';
import { editaisStore } from './_store';

export function GET() {
  return NextResponse.json(editaisStore);
}
