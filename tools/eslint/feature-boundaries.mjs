// Local ESLint plugin: feature folders inside an app may not import each other.
//
// Feature modules stay folders inside the apps (ADR 0009), so Nx project
// boundaries cannot see imports between them. A pattern list in
// no-restricted-imports only matches the text of a specifier, which a relative
// path such as '../clinics/manifest' bypasses. This rule resolves every module
// specifier against the importing file and compares the resolved path with the
// configured feature roots instead.
import path from 'node:path';

const toPosix = (p) => p.split(path.sep).join('/');

/** The feature folder name of `file` under one of `roots`, or null. */
function featureOf(file, roots) {
  const posix = toPosix(file);
  for (const root of roots) {
    const marker = `/${root}/`;
    const at = posix.lastIndexOf(marker);
    if (at === -1) continue;
    const feature = posix.slice(at + marker.length).split('/')[0];
    if (feature && !feature.includes('.')) return { root, feature };
  }
  return null;
}

const featureBoundaries = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow imports from one feature folder into another (any import form).',
    },
    schema: [
      {
        type: 'object',
        properties: { roots: { type: 'array', items: { type: 'string' }, minItems: 1 } },
        required: ['roots'],
        additionalProperties: false,
      },
    ],
    messages: {
      crossFeature:
        "Feature '{{from}}' must not import from feature '{{to}}' ({{specifier}}). Share through the app's composition folder or a library.",
    },
  },
  create(context) {
    const roots = context.options[0].roots.map((r) => r.replace(/^\/+|\/+$/g, ''));
    const filename = context.physicalFilename ?? context.filename;
    const source = featureOf(filename, roots);
    if (!source) return {};

    function check(node, specifier) {
      if (typeof specifier !== 'string' || !specifier.startsWith('.')) return;
      const resolved = path.resolve(path.dirname(filename), specifier);
      const target = featureOf(`${resolved}/`, roots);
      if (target && target.root === source.root && target.feature !== source.feature) {
        context.report({
          node,
          messageId: 'crossFeature',
          data: { from: source.feature, to: target.feature, specifier },
        });
      }
    }
    const literal = (n) => (n && n.type === 'Literal' ? n.value : undefined);

    return {
      ImportDeclaration: (node) => check(node.source, node.source.value),
      ExportNamedDeclaration: (node) => node.source && check(node.source, node.source.value),
      ExportAllDeclaration: (node) => check(node.source, node.source.value),
      ImportExpression: (node) => check(node.source, literal(node.source)),
      TSImportType: (node) => check(node, literal(node.argument?.literal ?? node.argument)),
      TSExternalModuleReference: (node) => check(node, literal(node.expression)),
      CallExpression(node) {
        const callee = node.callee;
        const isRequire = callee.type === 'Identifier' && callee.name === 'require';
        const isMock =
          callee.type === 'MemberExpression' &&
          ['jest', 'vi'].includes(callee.object?.name) &&
          ['mock', 'doMock', 'requireActual', 'importActual'].includes(callee.property?.name);
        if ((isRequire || isMock) && node.arguments[0]) {
          check(node.arguments[0], literal(node.arguments[0]));
        }
      },
    };
  },
};

export default { meta: { name: 'local' }, rules: { 'feature-boundaries': featureBoundaries } };
