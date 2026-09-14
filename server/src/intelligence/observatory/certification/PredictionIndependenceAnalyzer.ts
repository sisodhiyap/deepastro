/**
 * DeepAstro Prediction Independence Analyzer
 */

export type IndependenceClassification =
  | 'INDEPENDENT'
  | 'POSSIBLY_DEPENDENT'
  | 'DEPENDENT';

export interface ClusteredPredictionGroup {
  cluster_id: string;
  user_id: string;
  domain: string;
  prediction_ids: string[];
  classification: IndependenceClassification;
  overlap_window_days: number;
  reason: string;
}

export interface IndependenceAnalysisResult {
  total_predictions: number;
  independent_count: number;
  possibly_dependent_count: number;
  dependent_count: number;
  effective_sample_size: number;
  clustering_ratio: number;
  clusters: ClusteredPredictionGroup[];
  has_dependence_risk: boolean;
  warnings: string[];
}

export class PredictionIndependenceAnalyzer {
  static analyze(
    predictions: Array<{
      prediction_id: string;
      user_id: string;
      domain: string;
      prediction_target_time: string;
      prediction_text: string;
    }>
  ): IndependenceAnalysisResult {
    if (!predictions || predictions.length === 0) {
      return {
        total_predictions: 0,
        independent_count: 0,
        possibly_dependent_count: 0,
        dependent_count: 0,
        effective_sample_size: 0,
        clustering_ratio: 1.0,
        clusters: [],
        has_dependence_risk: false,
        warnings: ['Empty prediction set provided for independence analysis.'],
      };
    }

    const clusters: ClusteredPredictionGroup[] = [];
    const groupedByUserDomain = new Map<string, typeof predictions>();

    for (const p of predictions) {
      const key = p.user_id + ':::' + p.domain;
      const list = groupedByUserDomain.get(key) || [];
      list.push(p);
      groupedByUserDomain.set(key, list);
    }

    let dependentCount = 0;
    let possiblyDependentCount = 0;
    let independentCount = 0;
    let clusterIdx = 1;

    for (const [key, preds] of groupedByUserDomain.entries()) {
      const [userId, domain] = key.split(':::');

      if (preds.length === 1) {
        independentCount += 1;
        continue;
      }

      const sorted = [...preds].sort(
        (a, b) => new Date(a.prediction_target_time).getTime() - new Date(b.prediction_target_time).getTime()
      );

      let currentCluster: typeof preds = [sorted[0]];

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const timeDiffDays = Math.abs(
          (new Date(curr.prediction_target_time).getTime() - new Date(prev.prediction_target_time).getTime()) / (1000 * 86400)
        );

        if (timeDiffDays <= 14) {
          currentCluster.push(curr);
        } else if (timeDiffDays <= 45) {
          currentCluster.push(curr);
        } else {
          if (currentCluster.length > 1) {
            this.pushCluster(clusters, clusterIdx++, userId, domain, currentCluster);
          } else {
            independentCount += 1;
          }
          currentCluster = [curr];
        }
      }

      if (currentCluster.length > 1) {
        this.pushCluster(clusters, clusterIdx++, userId, domain, currentCluster);
      } else {
        independentCount += 1;
      }
    }

    for (const c of clusters) {
      if (c.classification === 'DEPENDENT') {
        dependentCount += c.prediction_ids.length;
      } else {
        possiblyDependentCount += c.prediction_ids.length;
      }
    }

    const N = predictions.length;
    let designEffect = 1.0;
    if (N > 0) {
      const clusterSizes = clusters.map(c => c.prediction_ids.length);
      const avgClusterSize = clusterSizes.length > 0
        ? clusterSizes.reduce((a, b) => a + b, 0) / clusterSizes.length
        : 1.0;
      const icc = (dependentCount * 0.85 + possiblyDependentCount * 0.4) / (N || 1);
      designEffect = Math.max(1.0, 1.0 + (avgClusterSize - 1.0) * icc);
    }

    const nEff = Math.max(1, Math.round(N / designEffect));
    const clusteringRatio = N > 0 ? Number((nEff / N).toFixed(3)) : 1.0;

    const warnings = [];
    if (dependentCount > 0) {
      warnings.push('Detected ' + dependentCount + ' dependent predictions sharing tight event windows in the same domain.');
    }
    if (clusteringRatio < 0.75) {
      warnings.push('High cluster pseudo-replication detected! Effective sample size is ' + nEff + ' vs nominal ' + N + '.');
    }

    return {
      total_predictions: N,
      independent_count: independentCount,
      possibly_dependent_count: possiblyDependentCount,
      dependent_count: dependentCount,
      effective_sample_size: nEff,
      clustering_ratio: clusteringRatio,
      clusters,
      has_dependence_risk: dependentCount > 0 || clusteringRatio < 0.8,
      warnings,
    };
  }

  private static pushCluster(
    clusters: ClusteredPredictionGroup[],
    idx: number,
    userId: string,
    domain: string,
    preds: Array<{ prediction_id: string; prediction_target_time: string }>
  ) {
    const minTime = Math.min(...preds.map(p => new Date(p.prediction_target_time).getTime()));
    const maxTime = Math.max(...preds.map(p => new Date(p.prediction_target_time).getTime()));
    const spanDays = Math.round((maxTime - minTime) / (1000 * 86400));
    const isTight = spanDays <= 14;

    clusters.push({
      cluster_id: 'CLUSTER_' + idx + '_' + domain,
      user_id: userId,
      domain,
      prediction_ids: preds.map(p => p.prediction_id),
      classification: isTight ? 'DEPENDENT' : 'POSSIBLY_DEPENDENT',
      overlap_window_days: spanDays,
      reason: isTight
        ? ('Tightly coupled forecasts within ' + spanDays + ' days in domain ' + domain + '.')
        : ('Moderately coupled forecasts across ' + spanDays + ' days in domain ' + domain + '.'),
    });
  }
}
