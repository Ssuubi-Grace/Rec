import { OnboardingDocumentTemplate, Candidate, OfferLetter } from '../types';

export const DEFAULT_DOCUMENT_TEMPLATES: OnboardingDocumentTemplate[] = [
  {
    id: 'doc-tpl-1',
    category: 'appointment_letter',
    title: 'Official Letter of Appointment',
    code: 'DC-DOC-APPOINTMENT',
    description: 'Formal job offer letter signed by Appointing Authority (Managing Director) detailing salary scale, allowances, probation, and reporting structure.',
    defaultDeliveryMode: 'template',
    version: 'v3.2 (2026)',
    lastUpdated: '14-Aug-2026',
    updatedBy: 'Sarah Namubiru (HR Lead)',
    requiresSignature: true,
    applicableRoles: 'All Positions',
    attachedFileName: 'DataCare_Executive_Appointment_Letter_Master.pdf',
    attachedFileSize: '420 KB',
    attachedFileDate: '12-Aug-2026',
    templateBody: `DATACARE UGANDA LIMITED
Plot 14 Lumumba Avenue, Kampala • P.O. Box 7421, Kampala, Uganda
ProMISe ERP Human Resource System — Ref: DC/HR/{YEAR}/OFR-{CANDIDATE_ID}

Date: {DATE}

To: {CANDIDATE_NAME}
Email: {CANDIDATE_EMAIL} • Phone: +{COUNTRY_CODE} {PHONE}
National Identification Number (NIN): {NATIONAL_ID}

RE: FORMAL OFFER OF APPOINTMENT AS {POSITION_UPPERCASE}

Dear {CANDIDATE_NAME},

Following your successful participation in our recruitment and selection process, including the technical assessments and final interview board evaluation, the Board of Directors and Management of DataCare Uganda Limited are pleased to offer you employment as {POSITION} under the following contractual terms:

1. POSITION AND DEPARTMENT:
   You will be appointed to the position of {POSITION} within the {DEPARTMENT} Department, reporting directly to {SUPERVISOR}.

2. REMUNERATION AND COMPENSATION PACKAGE:
   - Basic Monthly Gross Salary: UGX {SALARY}
   - Monthly Operational Allowances: UGX {ALLOWANCES}
   - Total Gross Monthly Remuneration: UGX {TOTAL_SALARY} (Subject to statutory PAYE and 5% employee NSSF deductions).

3. COMMENCEMENT AND TENURE:
   Your effective reporting date shall be {START_DATE}. This appointment is for a tenure of {CONTRACT_DURATION}, renewable upon mutual agreement and satisfactory performance appraisal.

4. PROBATIONARY PERIOD:
   You will serve a standard probationary period of {PROBATION_MONTHS} months from your commencement date, during which your performance and conduct will be reviewed.

5. BENEFITS AND STATUTORY COVENANTS:
   {SPECIAL_TERMS}

6. ACCEPTANCE OF OFFER:
   Please indicate your formal acceptance of this appointment by digitally counter-signing this letter in your candidate induction portal before {ACCEPTANCE_DEADLINE}.

Yours sincerely,

Dr. Arthur K.
Managing Director / Appointing Authority
DataCare Uganda Limited`
  },
  {
    id: 'doc-tpl-2',
    category: 'employment_contract',
    title: 'Fixed-Term Employment Contract (2 Years)',
    code: 'DC-DOC-CONTRACT-2YR',
    description: 'Comprehensive 7-clause legal employment contract under the Employment Act No. 6 of 2006 of the Republic of Uganda.',
    defaultDeliveryMode: 'template',
    version: 'v4.0 (Legal Cleared)',
    lastUpdated: '10-Aug-2026',
    updatedBy: 'Counsel Moses Alit (Legal Director)',
    requiresSignature: true,
    applicableRoles: 'All Positions',
    attachedFileName: 'DataCare_Uganda_Standard_Employment_Agreement_2026.pdf',
    attachedFileSize: '1.2 MB',
    attachedFileDate: '10-Aug-2026',
    templateBody: `================================================================================
                    DATACARE UGANDA LIMITED
          OFFICIAL EMPLOYMENT CONTRACT • FIXED TERM (2 YEARS)
================================================================================
Ref: DC-CONTRACT-2026-{CANDIDATE_ID}
Jurisdiction: Republic of Uganda (Employment Act, No. 6 of 2006)

PARTIES:
1. THE EMPLOYER: DATACARE UGANDA LIMITED (Plot 14, Acacia Avenue, Kampala, Uganda)
2. THE EMPLOYEE: {CANDIDATE_NAME} (NIN: {NATIONAL_ID})

TERMS AND CONDITIONS:
1. APPOINTMENT & DURATION:
   The Employer employs the Employee as {POSITION} in the {DEPARTMENT} Department for a fixed term of {CONTRACT_DURATION} commencing {START_DATE}.

2. PROBATION & PERFORMANCE EVALUATION:
   The first {PROBATION_MONTHS} months shall constitute a probationary period. Termination during probation requires 2 weeks' notice or pay in lieu.

3. REMUNERATION & STATUTORY OBLIGATIONS:
   Monthly Gross Remuneration: UGX {SALARY}. The Employer deducts 5% employee NSSF, pays 10% employer NSSF contribution, and withholds PAYE income tax as mandated by the Uganda Revenue Authority (URA).

4. WORKING HOURS & LEAVE ENTITLEMENT:
   Standard hours are 40 hours per week. Annual paid leave entitlement is 21 working days per calendar year after 6 months of continuous service.

5. TERMINATION OF CONTRACT:
   Either party may terminate this agreement by providing one (1) month written notice or payment of one month basic gross salary in lieu.

6. GOVERNING LAW & JURISDICTION:
   This Contract shall be governed by and construed in accordance with the Laws of the Republic of Uganda.`
  },
  {
    id: 'doc-tpl-3',
    category: 'nda',
    title: 'Non-Disclosure & Data Confidentiality Agreement (NDA)',
    code: 'DC-DOC-NDA-SEC',
    description: 'Proprietary source code, database architectures, client secrets, and Uganda Data Protection & Privacy Act 2019 compliance covenants.',
    defaultDeliveryMode: 'template',
    version: 'v2.8',
    lastUpdated: '08-Aug-2026',
    updatedBy: 'David Byamukama (Data Protection Officer)',
    requiresSignature: true,
    applicableRoles: 'All Positions',
    attachedFileName: 'DataCare_Proprietary_NDA_Confidentiality_Covenant.pdf',
    attachedFileSize: '580 KB',
    attachedFileDate: '08-Aug-2026',
    templateBody: `NON-DISCLOSURE AND PROPRIETARY INFORMATION COVENANT

BETWEEN: DataCare Uganda Limited AND {CANDIDATE_NAME} (Employee)

1. RECITALS:
   In the course of employment as {POSITION}, Employee will have access to confidential data, source code, client records, and algorithms.

2. CONFIDENTIAL INFORMATION:
   "Confidential Information" includes all technical data, trade secrets, software code, customer data, pricing, and system architectures.

3. NON-DISCLOSURE OBLIGATIONS:
   Employee agrees not to disclose, publish, or copy any Confidential Information to third parties without prior written executive authorization.

4. COMPLIANCE WITH DATA PROTECTION ACT 2019:
   Employee shall handle all personal data under the Uganda Data Protection and Privacy Act, 2019 and ISO/IEC 27001 cybersecurity frameworks.

5. DURATION OF RESTRICTION:
   Confidentiality covenants remain binding throughout employment and for five (5) years following termination of service.`
  },
  {
    id: 'doc-tpl-4',
    category: 'handbook',
    title: 'Code of Conduct & Employee HR Policy Handbook',
    code: 'DC-DOC-HANDBOOK',
    description: 'Anti-bribery, ethics, clean desk policy, equal opportunity, IT security, and whistleblower protection guidelines.',
    defaultDeliveryMode: 'attachment',
    version: 'v5.1 (Annual 2026 Edition)',
    lastUpdated: '01-Aug-2026',
    updatedBy: 'HR Operations Committee',
    requiresSignature: true,
    applicableRoles: 'All Positions',
    attachedFileName: 'DataCare_HR_Policy_Handbook_Code_of_Conduct_2026.pdf',
    attachedFileSize: '3.4 MB',
    attachedFileDate: '01-Aug-2026',
    templateBody: `DATACARE UGANDA LIMITED — CODE OF CONDUCT & HR HANDBOOK SUMMARY

SECTION A: ETHICAL CONDUCT & ANTI-CORRUPTION
- Zero tolerance for bribery, conflicts of interest, or unauthorized gift acceptance.

SECTION B: WORKPLACE INCLUSIVITY & EQUAL OPPORTUNITY
- Commitment to a safe, respectful, harassment-free workplace.

SECTION C: INFORMATION SECURITY & CLEAN DESK
- Strict adherence to 2FA authentication, laptop encryption, and secure disposal of printed records.

SECTION D: WHISTLEBLOWER PROTECTION
- Protected reporting channels directly to the Audit & Governance Committee.`
  },
  {
    id: 'doc-tpl-5',
    category: 'payroll_form',
    title: 'Direct Bank Deposit, NSSF & URA TIN Registration Declaration',
    code: 'DC-DOC-PAYROLL-FORM',
    description: 'Direct salary bank deposit setup, National Social Security Fund (NSSF) verification, and Uganda Revenue Authority (URA) TIN registration.',
    defaultDeliveryMode: 'template',
    version: 'v2.1',
    lastUpdated: '12-Aug-2026',
    updatedBy: 'Ronald Kafeero (Payroll Lead)',
    requiresSignature: false,
    applicableRoles: 'All Positions',
    attachedFileName: 'Direct_Deposit_Bank_NSSF_TIN_Mandate_Form.pdf',
    attachedFileSize: '290 KB',
    attachedFileDate: '05-Aug-2026',
    templateBody: `DIRECT SALARY DEPOSIT & STATUTORY TAX / NSSF MANDATE FORM

Employee Name: {CANDIDATE_NAME}
Designation: {POSITION}
Department: {DEPARTMENT}

1. BANK ACCOUNT PARTICULARS:
   - Financial Institution / Bank Name
   - Branch Name & Swift Code
   - Account Title (Must match National ID)
   - Account Number

2. STATUTORY REGISTRATION NUMBERS:
   - Uganda National Social Security Fund (NSSF) 12-Digit Number
   - Uganda Revenue Authority (URA) 10-Digit Tax Identification Number (TIN)

3. NEXT OF KIN / EMERGENCY BENEFICIARY DECLARATION:
   - Full Legal Name, Relationship, and Verified Phone Contact.`
  },
  {
    id: 'doc-tpl-6',
    category: 'academic_verification',
    title: 'Academic Transcripts, Certificates & National ID Verification Records',
    code: 'DC-DOC-CRED-RECORDS',
    description: 'Official university degree transcript, National ID NIN (NIRA validated), and professional reference clearance certificate.',
    defaultDeliveryMode: 'attachment',
    version: 'v1.9',
    lastUpdated: '15-Aug-2026',
    updatedBy: 'Background Screening Unit',
    requiresSignature: false,
    applicableRoles: 'All Positions',
    attachedFileName: 'Academic_Credential_Verification_Clearance.pdf',
    attachedFileSize: '1.8 MB',
    attachedFileDate: '15-Aug-2026',
    templateBody: `BACKGROUND INVESTIGATION & CREDENTIAL CLEARANCE CERTIFICATE

Subject: {CANDIDATE_NAME}
Position: {POSITION}
National ID (NIN): {NATIONAL_ID}

VERIFIED CREDENTIALS:
1. National Identification & Registration Authority (NIRA): Biometric Record VALIDATED
2. University Degree Transcript: Verified with Academic Registrar
3. Professional Reference Checks: 3/3 Positive References Cleared
4. Security & Compliance Vetting: Cleared for appointment with DataCare Uganda.`
  }
];

export function replaceTemplateTags(
  templateText: string = '',
  candidate?: Candidate | null,
  offer?: OfferLetter | null
): string {
  if (!templateText) return '';
  const cand = candidate || {
    id: 'C-001',
    name: 'Apollo Joshua Mukasa',
    email: 'apollo.mukasa@example.com',
    countryCode: '256',
    phone: '772123456',
    nationalId: 'CM96023412X98A',
    position: 'Senior Systems Architect',
    department: 'Technology & Digital Systems'
  } as Candidate;

  const currentYear = new Date().getFullYear().toString();
  const currentDate = '16-Aug-2026';
  const salary = offer?.grossSalaryMonthly || offer?.basicSalary || '4,500,000';
  const allowances = offer?.allowances || '500,000';
  const salaryNum = parseInt(String(salary).replace(/,/g, ''), 10) || 4500000;
  const allowNum = parseInt(String(allowances).replace(/,/g, ''), 10) || 500000;
  const totalSalary = (salaryNum + allowNum).toLocaleString();

  return templateText
    .replace(/{YEAR}/g, currentYear)
    .replace(/{DATE}/g, currentDate)
    .replace(/{CANDIDATE_ID}/g, (cand.id || 'C1').toUpperCase())
    .replace(/{CANDIDATE_NAME}/g, cand.name || 'Candidate Name')
    .replace(/{CANDIDATE_EMAIL}/g, cand.email || 'candidate@example.com')
    .replace(/{COUNTRY_CODE}/g, cand.countryCode || '256')
    .replace(/{PHONE}/g, cand.phone || '772000000')
    .replace(/{NATIONAL_ID}/g, cand.nationalId || 'CM96023412X98A')
    .replace(/{POSITION}/g, offer?.position || cand.position || 'Staff Role')
    .replace(/{POSITION_UPPERCASE}/g, (offer?.position || cand.position || 'STAFF ROLE').toUpperCase())
    .replace(/{DEPARTMENT}/g, offer?.department || cand.department || 'Operations')
    .replace(/{SUPERVISOR}/g, offer?.reportingSupervisor || 'Managing Director / Head of Department')
    .replace(/{SALARY}/g, salary)
    .replace(/{ALLOWANCES}/g, allowances)
    .replace(/{TOTAL_SALARY}/g, totalSalary)
    .replace(/{START_DATE}/g, offer?.startDate || '01-Sep-2026')
    .replace(/{CONTRACT_DURATION}/g, offer?.contractDuration || '2 Years (Renewable)')
    .replace(/{PROBATION_MONTHS}/g, String(offer?.probationMonths || 6))
    .replace(/{SPECIAL_TERMS}/g, offer?.specialTerms || 'Standard medical health insurance coverage, 21 days annual leave entitlement, and compliance with company non-disclosure agreements.')
    .replace(/{ACCEPTANCE_DEADLINE}/g, offer?.acceptanceDeadline || '25-Aug-2026');
}
