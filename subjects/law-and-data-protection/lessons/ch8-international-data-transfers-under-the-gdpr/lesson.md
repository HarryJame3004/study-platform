---
title: "International Data Transfers under the GDPR"
date: "2026-09-24"
---

# Learning Objectives

Master Chapter 8 — International data transfers under the GDPR — well enough to answer both multiple-choice and written exam questions on it.

# Lesson

> **In one sentence:** Personal data can leave Europe only if its protection travels with it. Check in order: is the destination officially "adequate"? If not, use an approved safeguard such as standard contract clauses. Only as a last resort, use a narrow exception like explicit consent.

## What is an international transfer?

Any transfer of personal data that is undergoing processing, or will be processed after transfer, **to a country outside the EEA** or **to an international organisation**. **EEA = EU + Iceland, Liechtenstein, Norway.**

Everyday examples from the lecture: an EU company using a US cloud provider; HR sharing staff data with Asian offices; a call centre in India or tech support in the Philippines; global CRM and payroll systems; EU and US research collaboration; banks processing international payments; responding to non-EEA regulators; offshore backups; M&A due diligence; international law, consulting and accounting firms.

## The two-step test

- The processing itself must have a **legal basis** and comply with all GDPR provisions (lawfulness, compatibility of disclosure with the original purpose, informing data subjects).
- The transfer must **also** comply with the international transfer provisions. These conditions are **additional** to normal obligations.

## The transfer ladder

| Situation                                         | Rule                                                                                                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Within the EEA                                    | Free movement. No EEA country may block transfers to another EEA country over protection concerns, as long as processing complies with GDPR principles. |
| Outside the EEA, **with** an adequacy decision | Transfer as if within the EU; general principles still apply.                                                                                           |
| Outside the EEA, **without** adequacy          | Use **appropriate safeguards** `Art. 46`                                                                                                             |
| No adequacy and no safeguards possible            | **Derogations** for specific situations `Art. 49`, last resort                                                                                       |

> **🧠 Memory hook**
>
> "**A**dequacy, **S**afeguards, **D**erogations": climb down the ladder only when the step above is not available. Think "A Safe Door".

## Adequacy decisions

The **European Commission** decides that a country, a territory, one or more sectors, or an international organisation offers an **adequate level of protection**, meaning standards similar or equivalent to the GDPR, with enforceable rights.

The Commission evaluates: the **rule of law**; the **data protection legal framework**; an **independent data protection authority**; **international commitments**; **effective enforcement**; **data subject rights**. In practice: clear rules, strong security, limits on processing, rights for EU citizens, ways to complain, rules for onward transfers.

**Countries listed in the lecture:** Andorra, Argentina, Canada (commercial organisations under PIPEDA), Faroe Islands, Guernsey, Israel, Isle of Man, Japan (business operators under the APPI plus Supplementary Rules), Jersey, New Zealand, Switzerland, Uruguay, and the USA (limited to the framework). Talks were ongoing with South Korea.

> **📚 Beyond the slides (useful for written answers)**
>
> The Commission has since adopted adequacy decisions for the United Kingdom and South Korea (2021). The CJEU invalidated the Privacy Shield in *Schrems II* (July 2020), which is why a replacement framework was needed.

### EU-US Privacy Shield and the Data Privacy Framework

The **Privacy Shield** (operational from **1 August 2016**) protected people in the EU whose data went to the US for commercial purposes. US companies **self-certified** against its Privacy Principles and **renewed every year**; the **US Department of Commerce** monitored them. In **July 2023** it was replaced by the **EU-US Data Privacy Framework (DPF)**, administered by the International Trade Administration (ITA) in the Department of Commerce, under which US organisations self-certify.

## Appropriate safeguards (no adequacy decision)

| Tool                                       | Key features                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Standard contractual clauses (SCCs)** | Commission's pre-approved "model contracts". Four modules: **controller to controller, controller to processor, processor to processor, processor to controller**. Requirements: transfer impact assessment; **cannot modify core clauses**; assess law in the recipient country; extra security measures may be needed; signed by both parties. |
| **Ad hoc clauses**                      | Custom contract clauses. Must be submitted to the DPA `Art. 46(3)(a)` and approved via the EDPB consistency mechanism `Art. 46(4)`.                                                                                                                                                                                                                    |
| **Binding corporate rules (BCRs)**      | Internal rules adopted by a **multinational group**, binding on all group entities and employees wherever located. Ideal for groups with many transfers. Must include: DP principles, transparency, legal enforceability, data subject rights, security, complaint procedures.                                                                      |
| **Codes of conduct**                    | Industry-specific guidelines with binding commitments, enforceable rights, safeguards, monitoring. Require **DPA approval**, regular compliance checks and an **accredited monitoring body** (e.g. EU Cloud Code of Conduct).                                                                                                                    |
| **Certification mechanisms**            | Third-party verification by **accredited certification bodies**: specific criteria, regular audits, renewal, monitoring (e.g. EuroPriSe, the European Privacy Seal).                                                                                                                                                                                |
| **Public authority instruments**        | Between public bodies: a legally binding and enforceable instrument (no specific authorisation needed), or provisions in administrative arrangements with enforceable rights, approved by the EDPB.                                                                                                                                                    |

## Derogations for specific situations `Art. 49`

Exemptions used **only** when neither adequacy nor appropriate safeguards are available. Controllers must first try the safeguards and, as part of accountability, **explain why** they could not use them.

| Derogation                                                                                   | Lecture example                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Explicit consent** after being informed of the risks (no adequacy, no safeguards)       | French manager's psychometric data sent to Singapore for a leadership programme; risks explained, consent documented                                                                                                                                     |
| Necessary for a **contract with the data subject** or pre-contract steps at their request | Italian online retailer sends name and address to a US shipping company; only delivery data                                                                                                                                                              |
| Necessary for a contract concluded **in the data subject's interest** with another person | (e.g. a travel agent booking a hotel abroad for a client)                                                                                                                                                                                                |
| **Important reasons of public interest** (recognised in EU or Member State law)           | German institute sends anonymised patient data to Canada during a health crisis                                                                                                                                                                          |
| **Legal claims**                                                                          | French company sends HR records to an Australian law firm to defend a discrimination claim                                                                                                                                                               |
| **Vital interests** where the person is physically or legally incapable of consent        | Spanish hospital sends records to a Japanese clinic for urgent life-saving treatment                                                                                                                                                                     |
| **Public register** open to consultation                                                  | Only to the extent legal conditions for consultation are met                                                                                                                                                                                             |
| **Compelling legitimate interests** (final fallback)                                      | Only if: no other derogation applies; **not repetitive**; **limited number** of people; interests not overridden by the person's rights; controller assessed and put safeguards in place; **informed the SA**; **informed the data subject** |

## Police and justice cooperation

Transfers may happen under international agreements. Bodies like **Europol** and **Eurojust** apply DP principles. The EU has **Passenger Name Record (PNR)** agreements with the **USA, Canada and Australia**: booking and check-in data used against serious crime and terrorism, allowed only under a bilateral agreement with high protection. The EU-US **Terrorist Finance Tracking Programme (TFTP)** covers financial data.

> **⚠️ Exam traps**
>
> - Adequacy is decided by the **European Commission**, not the EDPB or national DPAs.
>
> - Norway, Iceland and Liechtenstein are **not** third countries (they are EEA).
>
> - Consent for transfers must be **explicit** and **informed of the risks**; ordinary consent is not enough.
>
> - Derogations are the **last** resort, not a convenient first choice.

# Summary

Use the flashcards below for spaced repetition, then take the chapter quiz. Re-read any section you missed.
