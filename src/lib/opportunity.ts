import type {Client,Product,Level} from './types';
import {calendarDate} from './timeline';
import {SCENARIO_DAY} from './constants';
export type OpportunityPoint={text:string;sourceIds:string[]};
export type OpportunitySection=OpportunityPoint&{title:string;kind:'Documented context'|'Suggested approach'|'To confirm'};
export function opportunityBrief(c:Client,p:Product){
 const verified=(id?:string)=>!!id&&c.sources.some(s=>s.id===id&&s.status==='Verified');
 const current=(id?:string)=>verified(id)&&c.sources.some(s=>s.id===id&&SCENARIO_DAY-s.day<=90);
 const facts=c.facts.filter(f=>f.status==='Verified'&&current(f.sourceId));
 const ids=(keys:string[])=>[...new Set(facts.filter(f=>keys.includes(f.key)).map(f=>f.sourceId))];
 const point=(text:string,sourceIds:string[]=[]):OpportunityPoint=>({text,sourceIds:[...new Set(sourceIds.filter(verified))]});
 const primary=current(c.sourceId);const cross=facts.find(f=>f.key==='interest'&&String(f.value).toLowerCase().includes(p.category.toLowerCase()));
 const interest=c.category===p.category?(primary?c.interest:''):cross?String(cross.value):'';
 const interestSources=c.category===p.category?facts.filter(f=>f.key==='interest'&&c.interest&&(c.interest.includes(String(f.value))||String(f.value).includes(c.interest))).map(f=>f.sourceId):cross?[cross.sourceId]:[];
 const preference=facts.some(f=>f.key==='preference')&&!/not recorded/i.test(c.preference)?c.preference:'';
 const priority=facts.some(f=>f.key==='priority')?c.priority:'The business objective needs reconfirmation';
 const objection=facts.filter(f=>f.key==='objection').map(f=>String(f.value)).join('; ');
 const dossier=c.dossier&&current(c.dossier.sourceId)?c.dossier:undefined;
 const outcome=verified(c.successSource)?c.success:'';
 const criteria=facts.filter(f=>f.key==='financialContext'||/decision criter/i.test(f.group||''));const styles=facts.filter(f=>f.key==='analysisStyle');const outcomes=facts.filter(f=>f.key==='goal');
 const variable=/vary|variable|amend|change.*(?:amount|timing)|order.*change|provisional/i.test(objection);
 const cost=/cost|pricing|price|fee/i.test(objection);
 const commitment=/fixed obligation|reluctant.*obligation/i.test(objection);
 const governance=/policy|approval|credit|capacity|collateral/i.test(objection);
 const deadline=c.due===undefined?undefined:c.due-SCENARIO_DAY;
 const open=p.category==='FX'?Math.max(0,(c.gross||0)-c.hedged):undefined;
 const quantitative=p.category==='FX'&&c.gross!==undefined?`${c.currency} ${open!.toLocaleString('en-US')} remains unhedged against a ${c.gross.toLocaleString('en-US')} gross payable.`:priority+'.';
 const tension=variable?'Budget certainty matters, with flexibility still to resolve':cost?'Cost clarity is central to the next discussion':commitment?'Certainty must justify the contractual commitment':governance?'The documented need must clear approval and operating constraints':interest?'An expressed business need creates an opening for a tailored discussion':'Relevant exposure creates a reason to validate the need';
 const opening=variable?`${c.contact.split(' ')[0]}, how much of the payment schedule is firm and how much may move with production? Could we compare certainty, cost and flexibility for those two portions before discussing terms?`:cost?`${c.contact.split(' ')[0]}, which costs or obligations would make this unsuitable? Could we agree the assumptions and alternatives for a transparent comparison first?`:`${c.contact.split(' ')[0]}, is ${priority.charAt(0).toLowerCase()+priority.slice(1)} still the right starting point? What would you need to see to judge whether ${p.name} is worth exploring?`;
 const approach=variable?'Confirm the firm and variable portions of the payment schedule, then compare budget certainty, all-in cost and flexibility. Do not assume a fixed obligation fits the variable portion.':cost?'Lead with an explicit cost-and-obligation comparison and agree acceptable tradeoffs before proposing terms.':commitment?'Compare the contractual obligation with current arrangements and agree which commitments would be acceptable before proposing terms.':governance?'Start with the approval path, operating capacity and eligibility conditions before investing in a detailed proposal.':!interest?'Ask whether the documented need warrants a conversation before pitching the product.':'Connect the recorded business objective to a proportionate comparison of alternatives, using the preferred format.';
 const supports:OpportunityPoint[]=[];const limits:OpportunityPoint[]=[];
 if(interest)supports.push(point('Recorded discussion interest: '+interest,interestSources));else limits.push(point('Product appetite is unconfirmed; exposure alone does not establish interest.'));
 if(primary&&deadline!==undefined)supports.push(point(`A recorded ${p.category==='FX'?'payment':'review / shipment'} is ${deadline} days away: ${calendarDate(c.due)}.`,ids(['due'])));
 if(preference)supports.push(point('An engagement format is documented: '+preference,ids(['preference'])));else limits.push(point('The preferred presentation and discussion format are unconfirmed.'));
 if(objection)limits.push(point('Recorded reservation: '+objection,ids(['objection'])));
 if(criteria.length)supports.push(point('Reviewed decision drivers: '+criteria.map(f=>String(f.value)).join('; '),criteria.map(f=>f.sourceId)));
 if(!dossier)limits.push(point('Approvers, final decision criteria and adoption requirements need confirmation.'));
 const readiness:Level=!primary||!interest||c.category!==p.category?'Unknown':c.appetite==='High'&&preference?'High':c.appetite==='Low'?'Low':'Medium';
 const coverage=[facts.some(f=>f.key==='priority'),!!preference,!!dossier||criteria.length>0,!!outcome,!!objection].filter(Boolean).length;
 const unknowns=[...(variable?['How much of the payment is firm, what may change, and how will amendments be managed?']:[]),...(!dossier?['Who approves, which policy or credit conditions apply, and who owns implementation?']:['Are the recorded committee and implementation arrangements still current?']),...(!preference?['Which format and level of detail would make the discussion useful?']:[]),...(!outcome?['Which previous engagements or materials worked, and is there an outcome record?']:[])];
 const wins=[...(styles.length?['Reviewed visual instructions: '+styles.map(f=>String(f.value)).join('; ')+'.']:[]),preference?'Use the requested format: '+preference+'.':'Agree the format before preparing materials.',criteria.length?'Reviewed decision criteria: '+criteria.map(f=>String(f.value)).join('; ')+'.':dossier?'Decision criteria: '+dossier.criteria:'Decision criteria are not fully documented; ask which tradeoffs would determine the choice.',outcome?'Prior outcome: '+outcome+' This informs the approach to the prior engagement only; it does not prove success or demand for this product.':'No verified previous success is recorded; do not claim a relationship win.'].join(' ');
 const sections:OpportunitySection[]=[
 {...point(`Recorded priority: ${priority}. ${outcomes.length?'Additional reviewed outcomes: '+outcomes.map(f=>String(f.value)).join('; ')+'. ':''}${quantitative} ${interest?'Recorded interest concerns '+interest+', not agreement to purchase.':'The exposure suggests relevance; appetite remains unconfirmed.'}`,[...ids(['priority','goal','gross','hedged']),...interestSources]),title:'Why this matters to them',kind:'Documented context'},
 {...point(deadline===undefined?'No dated trigger is recorded. Confirm timing before asserting urgency.':`The recorded ${p.category==='FX'?'payment':'review / shipment'} date is ${calendarDate(c.due)}, ${deadline} days from the fixed demo date. This creates a reason to reconfirm the need; it does not predict when the client will buy.`,ids(['due'])),title:'Why now',kind:deadline===undefined?'To confirm':'Documented context'},
 {...point(wins,[...ids(['preference','analysisStyle','financialContext']),...(dossier?[dossier.sourceId]:[]),...(outcome?[c.successSource!]:[])]),title:'What could win the conversation',kind:'Suggested approach'},
 {...point((objection?'Recorded concern: '+objection+'. ':'No explicit objection is recorded; absence of an objection is not acceptance. ')+(variable?'The tension to resolve is certainty versus flexibility. ':cost?'The tension to resolve is certainty versus all-in cost. ':'')+'Product review conditions: '+p.constraints+'.',ids(['objection'])),title:'What could derail it',kind:'Suggested approach'},
 {...point(opening+' '+approach,[...ids(['priority','preference','objection'])]),title:'Recommended opening',kind:'Suggested approach'},
 {...point(unknowns.join(' ')),title:'What we still need to learn',kind:'To confirm'}
 ];
 return {headline:tension,compact:(interest?'Recorded interest: '+interest+'. ':'Interest is unconfirmed. ')+(objection?'Key barrier: '+objection+'. ':'Decision criteria still need confirmation. '),approach,quantitative,readiness,supports,limits,sections,coverage,coverageLabel:`${coverage}/5 persona areas documented`,coverageExplanation:'Coverage of business priority, communication, decision process, prior outcome and reservations; completeness is separate from exposure evidence.'};
}
