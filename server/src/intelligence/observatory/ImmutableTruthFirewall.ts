/**
 * DeepAstro Immutable Truth Firewall
 * Hard boundary between CALCULATION TRUTH and INTERPRETATION INTELLIGENCE.
 * Protects CalculationSnapshot, ephemeris, D1-D60, house mathematics, and planetary coordinates.
 * Invariant: Calculation truth is immutable. Any attempted modification triggers CRITICAL_SECURITY_ALERT.
 */

export interface SecurityAlert {
  alertId: string;
  timestamp: string;
  severity: 'CRITICAL_SECURITY_ALERT' | 'HIGH' | 'WARNING';
  actionAttempted: string;
  targetProperty: string;
  sourceModule: string;
  userId?: string;
  callStack?: string;
}

export class ImmutableTruthFirewall {
  private static securityAlerts: SecurityAlert[] = [];

  public static sealCalculationSnapshot<T extends object>(snapshot: T, context = 'CalculationCore'): Readonly<T> {
    if (!snapshot || typeof snapshot !== 'object') {
      return snapshot;
    }

    const deepFreeze = (obj: any): any => {
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach((prop) => {
        if (
          obj[prop] !== null &&
          (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
          !Object.isFrozen(obj[prop])
        ) {
          deepFreeze(obj[prop]);
        }
      });
      return obj;
    };

    const frozen = deepFreeze(JSON.parse(JSON.stringify(snapshot)));

    return new Proxy(frozen, {
      set: (target, prop, value) => {
        const alertId = 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const alert: SecurityAlert = {
          alertId,
          timestamp: new Date().toISOString(),
          severity: 'CRITICAL_SECURITY_ALERT',
          actionAttempted: 'MUTATION_OF_CALCULATION_SNAPSHOT',
          targetProperty: String(prop),
          sourceModule: context,
          callStack: new Error().stack,
        };
        ImmutableTruthFirewall.recordAlert(alert);
        throw new Error('CRITICAL_SECURITY_ALERT: Attempted modification of immutable calculation truth [' + String(prop) + ']. Operation blocked.');
      },
      deleteProperty: (target, prop) => {
        const alertId = 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const alert: SecurityAlert = {
          alertId,
          timestamp: new Date().toISOString(),
          severity: 'CRITICAL_SECURITY_ALERT',
          actionAttempted: 'DELETION_OF_CALCULATION_SNAPSHOT_PROPERTY',
          targetProperty: String(prop),
          sourceModule: context,
          callStack: new Error().stack,
        };
        ImmutableTruthFirewall.recordAlert(alert);
        throw new Error('CRITICAL_SECURITY_ALERT: Attempted deletion of immutable calculation truth [' + String(prop) + ']. Operation blocked.');
      }
    });
  }

  public static recordAlert(alert: SecurityAlert): void {
    this.securityAlerts.push(alert);
  }

  public static getAlerts(): SecurityAlert[] {
    return [...this.securityAlerts];
  }

  public static clearAlerts(): void {
    this.securityAlerts = [];
  }
}
