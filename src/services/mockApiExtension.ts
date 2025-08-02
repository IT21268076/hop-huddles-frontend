// services/mockApiExtension.ts
// Frontend extension for mock AI testing
import { HuddleSequence, Huddle, HuddleCombination } from '../types';

/**
 * MOCK API EXTENSION - FOR TESTING ONLY
 * 
 * This provides frontend utilities for working with mock AI generated content
 * Helps with testing the preview interface and edit modal functionality
 * 
 * TO REMOVE: Delete this entire file when integrating real RAG model
 */

interface MockSequenceResponse {
  sequenceId: number;
  title: string;
  description?: string;
  topic: string;
  sequenceStatus: string;
  totalCombinations: number;
  estimatedDurationMinutes?: number;
  branchId: number;
  branchName: string;
  branchDisplayName: string;
  targetRoles: string[];
  targetDisciplines: string[];
  createdByUserName: string;
  createdAt: string;
  publishedAt?: string;
  publishedByUserName?: string;
  canEdit: boolean;
  canPublish: boolean;
  isPublished: boolean;
  isDraft: boolean;
  isInReview: boolean;
  combinations: MockCombination[];
}

interface MockCombination {
  combinationId: number;
  userRole: string;
  discipline: string;
  title: string;
  description?: string;
  totalHuddles: number;
  estimatedDurationMinutes?: number;
  huddles: MockHuddle[];
}

interface MockHuddle {
  huddleId: number;
  title: string;
  description?: string;
  orderIndex: number;
  voiceScript: string;
  pdfUrl: string;
  audioUrl?: string;
  durationMinutes: number;
  roleDisciplineDisplay: string;
  combinationKey: string;
  canEdit: boolean;
}

export class MockApiExtension {
  /**
   * Check if we're in mock mode
   */
  static isMockMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           localStorage.getItem('mock.ai.enabled') === 'true';
  }

  /**
   * Get mock sequence with combinations for preview testing
   */
  static generateMockSequencePreview(sequenceRequest: any): MockSequenceResponse {
    const sequenceId = Date.now(); // Use timestamp as mock ID
    const combinations = this.generateMockCombinations(sequenceRequest, sequenceId);

    return {
      sequenceId,
      title: sequenceRequest.title,
      description: sequenceRequest.description,
      topic: sequenceRequest.topic,
      sequenceStatus: 'DRAFT',
      totalCombinations: combinations.length,
      estimatedDurationMinutes: combinations.length * 15, // 15 min per combination
      branchId: sequenceRequest.branchId,
      branchName: 'Mock Branch Name',
      branchDisplayName: 'Mock Branch - City, ST',
      targetRoles: sequenceRequest.targetRoles,
      targetDisciplines: sequenceRequest.targetDisciplines,
      createdByUserName: 'Mock Educator',
      createdAt: new Date().toISOString(),
      canEdit: true,
      canPublish: false,
      isPublished: false,
      isDraft: true,
      isInReview: false,
      combinations,
    };
  }

  /**
   * Generate mock combinations based on role-discipline pairs
   */
  private static generateMockCombinations(request: any, sequenceId: number): MockCombination[] {
    const combinations: MockCombination[] = [];
    let combinationId = 1;

    for (const role of request.targetRoles) {
      for (const discipline of request.targetDisciplines) {
        const combination = this.generateMockCombination(
          combinationId++,
          role,
          discipline,
          request.topic,
          sequenceId,
          request.numberOfHuddlesPerCombination || 3
        );
        combinations.push(combination);
      }
    }

    return combinations;
  }

  /**
   * Generate a single mock combination
   */
  private static generateMockCombination(
    combinationId: number,
    role: string,
    discipline: string,
    topic: string,
    sequenceId: number,
    numberOfHuddles: number
  ): MockCombination {
    const huddles: MockHuddle[] = [];

    for (let i = 1; i <= numberOfHuddles; i++) {
      const huddle = this.generateMockHuddle(
        combinationId * 10 + i,
        role,
        discipline,
        topic,
        i,
        sequenceId
      );
      huddles.push(huddle);
    }

    return {
      combinationId,
      userRole: role,
      discipline,
      title: `${role} - ${discipline}`,
      description: `Mock content series for ${discipline} professionals in ${role} roles, focusing on ${topic}`,
      totalHuddles: numberOfHuddles,
      estimatedDurationMinutes: numberOfHuddles * 5,
      huddles,
    };
  }

  /**
   * Generate a single mock huddle
   */
  private static generateMockHuddle(
    huddleId: number,
    role: string,
    discipline: string,
    topic: string,
    orderIndex: number,
    sequenceId: number
  ): MockHuddle {
    const combinationKey = `${role}_${discipline}`.toLowerCase();
    
    return {
      huddleId,
      title: `${discipline} ${role} Huddle ${orderIndex}: ${this.getHuddleTitle(topic, orderIndex)}`,
      description: `Huddle ${orderIndex} designed for ${discipline} professionals in ${role} roles`,
      orderIndex,
      voiceScript: this.generateMockVoiceScript(role, discipline, topic, orderIndex),
      pdfUrl: `/api/mock-pdfs/sequence_${sequenceId}/combination_${combinationKey}/huddle_${orderIndex}.pdf`,
      audioUrl: undefined,
      durationMinutes: 5,
      roleDisciplineDisplay: `${role} - ${discipline}`,
      combinationKey,
      canEdit: true,
    };
  }

  /**
   * Generate mock voice script
   */
  private static generateMockVoiceScript(role: string, discipline: string, topic: string, huddleIndex: number): string {
    const roleSpecific = this.getRoleSpecificContent(role);
    const disciplineSpecific = this.getDisciplineSpecificContent(discipline);
    const huddleSpecific = this.getHuddleSpecificContent(topic, huddleIndex);

    return `Welcome to Huddle ${huddleIndex} for ${discipline} professionals in ${role} roles.

${huddleSpecific}

${disciplineSpecific}

${roleSpecific}

This mock voice script demonstrates the type of personalized content that would be generated for your specific role and discipline combination.

In the actual implementation, this content would be:
• Generated by advanced AI based on your branch location and context
• Tailored to current healthcare best practices
• Updated with the latest regulatory requirements
• Customized for your specific patient population

Key learning points for today:
1. Understanding your role-specific responsibilities
2. Applying discipline-specific best practices  
3. Integrating these concepts into daily patient care

Take a moment to reflect on how you'll apply today's learning in your practice setting.

Thank you for your attention. This concludes Huddle ${huddleIndex}.

🤖 This is mock content generated for testing purposes only.`;
  }

  private static getHuddleTitle(topic: string, index: number): string {
    const titles = [
      `Introduction to ${topic}`,
      `Advanced Concepts in ${topic}`,
      `Practical Application of ${topic}`,
      `Best Practices for ${topic}`,
      `Quality Assurance in ${topic}`,
    ];
    return titles[Math.min(index - 1, titles.length - 1)];
  }

  private static getHuddleSpecificContent(topic: string, huddleIndex: number): string {
    const content = [
      `Today we're starting our journey with ${topic}. This foundational session will establish the key concepts you need to understand.`,
      `Building on our previous discussion, we'll explore more advanced aspects of ${topic} and how they apply to your daily practice.`,
      `In this final session, we'll focus on practical implementation strategies for ${topic} in real-world scenarios.`,
    ];
    return content[Math.min(huddleIndex - 1, content.length - 1)];
  }

  private static getRoleSpecificContent(role: string): string {
    switch (role) {
      case 'EDUCATOR':
        return 'As an educator, your role involves not only understanding these concepts but also effectively teaching them to others. Consider how you can break down complex information into digestible learning modules.';
      case 'DIRECTOR':
        return 'From a director perspective, think about how these concepts align with organizational goals and how you can support implementation across your teams.';
      case 'CLINICAL_MANAGER':
        return 'As a clinical manager, you\'ll need to balance these best practices with operational efficiency and team coordination.';
      case 'FIELD_CLINICIAN':
        return 'Your hands-on experience as a field clinician is invaluable. Focus on how these concepts enhance the direct care you provide to patients.';
      default:
        return 'Consider how these concepts apply to your specific role and responsibilities in the healthcare team.';
    }
  }

  private static getDisciplineSpecificContent(discipline: string): string {
    switch (discipline) {
      case 'RN':
        return 'From a nursing perspective, this involves comprehensive patient assessment, care coordination, and evidence-based practice implementation.';
      case 'PT':
        return 'Physical therapy applications focus on movement assessment, therapeutic intervention, and functional outcome measurement.';
      case 'OT':
        return 'Occupational therapy considerations include activities of daily living, environmental assessment, and adaptive strategy development.';
      case 'SLP':
        return 'Speech-language pathology aspects involve communication assessment, swallowing safety, and cognitive-communication interventions.';
      case 'MSW':
        return 'Social work perspectives address psychosocial factors, resource coordination, and discharge planning considerations.';
      default:
        return `From your ${discipline} professional perspective, consider how these concepts integrate with your discipline-specific responsibilities.`;
    }
  }

  /**
   * Mock update voice script for testing edit functionality
   */
  static mockUpdateVoiceScript(huddleId: number, newScript: string): Promise<MockHuddle> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve({
          huddleId,
          title: `Mock Updated Huddle ${huddleId}`,
          description: 'Mock huddle updated via voice script edit',
          orderIndex: 1,
          voiceScript: newScript,
          pdfUrl: `/api/mock-pdfs/sequence_1/combination_mock/huddle_${huddleId}.pdf`,
          durationMinutes: 5,
          roleDisciplineDisplay: 'MOCK - TESTING',
          combinationKey: 'mock_testing',
          canEdit: true,
        });
      }, 500);
    });
  }

  /**
   * Display mock warning in development
   */
  static showMockWarning(): void {
    if (this.isMockMode()) {
      console.warn(
        '🤖 MOCK AI SERVICE ACTIVE - TESTING ONLY\n' +
        'Content generation is using mock data.\n' +
        'Set mock.ai.enabled=false to use real AI service.'
      );
    }
  }

  /**
   * Helper to check if a URL is a mock PDF
   */
  static isMockPdf(url: string): boolean {
    return url.includes('/api/mock-pdfs/');
  }
}

// Initialize mock warning in development
if (typeof window !== 'undefined') {
  MockApiExtension.showMockWarning();
}