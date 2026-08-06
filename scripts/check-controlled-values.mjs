let ts;
try { ts=(await import('typescript')).default; }
catch { ts=(await import('file:///opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js')).default; }
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
const files=[];
async function walk(d){for(const e of await readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())await walk(p);else if(/\.(jsx|tsx)$/.test(p))files.push(p)}}
await walk('src/legacy/admin');
const findings=[];
for(const file of files){const source=await readFile(file,'utf8');const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JSX);
function visit(node){if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){const tag=node.tagName.getText(sf).toLowerCase();if(['input','textarea','select'].includes(tag)){for(const prop of node.attributes.properties){if(!ts.isJsxAttribute(prop)||prop.name.getText(sf)!=='value')continue;const init=prop.initializer;if(!init||!ts.isJsxExpression(init)||!init.expression)continue;const expr=init.expression;const safe=ts.isBinaryExpression(expr)&&[ts.SyntaxKind.QuestionQuestionToken,ts.SyntaxKind.BarBarToken].includes(expr.operatorToken.kind);const lit=ts.isStringLiteral(expr)||ts.isNoSubstitutionTemplateLiteral(expr)||ts.isNumericLiteral(expr)||expr.kind===ts.SyntaxKind.TrueKeyword||expr.kind===ts.SyntaxKind.FalseKeyword;if(!safe&&!lit&&!/^String\s*\(/.test(expr.getText(sf))){const loc=sf.getLineAndCharacterOfPosition(expr.getStart(sf));findings.push(`${file}:${loc.line+1}:${loc.character+1}: ${expr.getText(sf)}`)}}}}ts.forEachChild(node,visit)}visit(sf)}
if(findings.length){console.error(findings.join('\n'));process.exit(1)}
console.log(`Controlled input null-safety check passed (${files.length} files).`)
