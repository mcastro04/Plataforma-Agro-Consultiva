'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface PlotEvaluation {
  id: string;
  phenological_stage?: string;
  pest_or_disease?: string;
  infestation_level?: string;
  weeds?: string;
  technical_recommendation?: string;
  plot: {
    id: string;
    name: string;
    crop?: string;
    area_hectares?: number;
  };
  media: Array<{
    id: string;
    file_path: string;
    media_type: string;
  }>;
  created_at: string;
}

interface VisitData {
  id: string;
  scheduled_date: string;
  status: string;
  objective?: string;
  discussion_summary?: string;
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  property: {
    id: string;
    name: string;
    city?: string;
  };
  plotEvaluations: PlotEvaluation[];
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2 solid #000',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  sectionContent: {
    marginBottom: 15,
    lineHeight: 1.6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: 150,
  },
  value: {
    flex: 1,
  },
  evaluationCard: {
    marginBottom: 20,
    padding: 15,
    border: '1 solid #ddd',
    borderRadius: 5,
  },
  evaluationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2563eb',
  },
  evaluationField: {
    marginBottom: 8,
    lineHeight: 1.5,
  },
  evaluationLabel: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  evaluationValue: {
    color: '#333',
  },
  recommendation: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 3,
    lineHeight: 1.6,
  },
  imagePlaceholder: {
    width: 150,
    height: 100,
    backgroundColor: '#e5e7eb',
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
    borderTop: '1 solid #ddd',
    paddingTop: 10,
  },
});

const VisitReportPDF: React.FC<{ template: VisitData }> = ({ template }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo} />
            <Text style={styles.title}>Relatório Técnico de Visita</Text>
            <Text style={styles.subtitle}>Plataforma Agro-Consultiva</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>
              Data: {new Date(template.scheduled_date).toLocaleDateString('pt-BR')}
            </Text>
            <Text style={styles.subtitle}>
              Status: {template.status}
            </Text>
          </View>
        </View>

        {/* Informações do Cliente e Propriedade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={styles.sectionContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{template.client.name}</Text>
            </View>
            {template.client.phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Telefone:</Text>
                <Text style={styles.value}>{template.client.phone}</Text>
              </View>
            )}
            {template.client.email && (
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{template.client.email}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Propriedade:</Text>
              <Text style={styles.value}>{template.property.name}</Text>
            </View>
            {template.property.city && (
              <View style={styles.row}>
                <Text style={styles.label}>Cidade:</Text>
                <Text style={styles.value}>{template.property.city}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Objetivo da Visita */}
        {template.objective && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objetivo da Visita</Text>
            <Text style={styles.sectionContent}>{template.objective}</Text>
          </View>
        )}

        {/* Pauta com o Produtor */}
        {template.discussion_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pauta com o Produtor</Text>
            <Text style={styles.sectionContent}>{template.discussion_summary}</Text>
          </View>
        )}

        {/* Avaliações de Campo */}
        {template.plotEvaluations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Avaliações de Campo ({template.plotEvaluations.length})
            </Text>
            {template.plotEvaluations.map((evaluation, index) => (
              <View key={evaluation.id} style={styles.evaluationCard} break={index > 0}>
                <Text style={styles.evaluationTitle}>
                  Talhão: {evaluation.plot.name}
                  {evaluation.plot.crop && ` - ${evaluation.plot.crop}`}
                  {evaluation.plot.area_hectares && ` (${evaluation.plot.area_hectares} ha)`}
                </Text>

                {evaluation.phenological_stage && (
                  <View style={styles.evaluationField}>
                    <Text style={styles.evaluationLabel}>Estádio Fenológico:</Text>
                    <Text style={styles.evaluationValue}>{evaluation.phenological_stage}</Text>
                  </View>
                )}

                {evaluation.pest_or_disease && (
                  <View style={styles.evaluationField}>
                    <Text style={styles.evaluationLabel}>Praga ou Doença Identificada:</Text>
                    <Text style={styles.evaluationValue}>{evaluation.pest_or_disease}</Text>
                  </View>
                )}

                {evaluation.infestation_level && (
                  <View style={styles.evaluationField}>
                    <Text style={styles.evaluationLabel}>Nível de Infestação:</Text>
                    <Text style={styles.evaluationValue}>{evaluation.infestation_level}</Text>
                  </View>
                )}

                {evaluation.weeds && (
                  <View style={styles.evaluationField}>
                    <Text style={styles.evaluationLabel}>Plantas Daninhas:</Text>
                    <Text style={styles.evaluationValue}>{evaluation.weeds}</Text>
                  </View>
                )}

                {evaluation.technical_recommendation && (
                  <View style={styles.evaluationField}>
                    <Text style={styles.evaluationLabel}>Recomendação Técnica:</Text>
                    <Text style={styles.recommendation}>{evaluation.technical_recommendation}</Text>
                  </View>
                )}

                {evaluation.media.length > 0 && (
                  <View style={styles.evaluationField}>
                    <Text style={styles.evaluationLabel}>Mídias Anexadas:</Text>
                    {evaluation.media.map((media) => (
                      <View key={media.id} style={styles.imagePlaceholder}>
                        <Text style={{ fontSize: 10, color: '#666' }}>
                          {media.media_type === 'FOTO' ? '📷 Foto' : '🎤 Áudio'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={{ fontSize: 10, color: '#666', marginTop: 10 }}>
                  Data da avaliação: {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às{' '}
            {new Date().toLocaleTimeString('pt-BR')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const VisitReportPDFDownload: React.FC<{ visitData: VisitData }> = ({ visitData }) => {
  return (
    <PDFDownloadLink
      document={<VisitReportPDF template={visitData} />}
      fileName={`relatorio-visita-${visitData.id}-${new Date().toISOString().split('T')[0]}.pdf`}
      className="inline-block"
    >
      {({ blob, url, loading, error }) => (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Gerando PDF...' : 'Gerar Relatório PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default VisitReportPDF;

