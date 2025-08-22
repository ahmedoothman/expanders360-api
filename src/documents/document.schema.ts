import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResearchDocument = ResearchDoc & Document;

@Schema({ timestamps: true })
export class ResearchDoc {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  projectId: number;

  @Prop([String])
  tags: string[];

  @Prop()
  fileUrl?: string;

  @Prop()
  fileSize?: number;

  @Prop()
  mimeType?: string;
}

export const ResearchDocumentSchema = SchemaFactory.createForClass(ResearchDoc);

// Add text index for search
ResearchDocumentSchema.index({ title: 'text', content: 'text', tags: 'text' });
