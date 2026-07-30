function text(value) {
  return String(value || '').trim();
}

const LOCAL_CONNECTION_CONFIG_KEYS = ['owner', 'ownerType', 'project', 'fieldIds'];

export function mergeWorkConfig(publicConfig = {}, localConfig = {}) {
  const leakedKeys = LOCAL_CONNECTION_CONFIG_KEYS.filter((key) => Object.hasOwn(publicConfig, key));
  if (leakedKeys.length) {
    throw new Error(`tracked work config contains local connection keys: ${leakedKeys.join(', ')}`);
  }

  for (const key of ['productRepo', 'productName']) {
    if (!publicConfig[key]) throw new Error(`tracked work config is missing ${key}`);
  }
  for (const key of ['owner', 'project']) {
    if (!localConfig[key]) throw new Error(`local work config is missing ${key}`);
  }
  if (!Object.keys(localConfig.fieldIds || {}).length) {
    throw new Error('local work config is missing fieldIds');
  }

  return {
    ...publicConfig,
    owner: localConfig.owner,
    ownerType: localConfig.ownerType || 'user',
    project: localConfig.project,
    fieldIds: localConfig.fieldIds,
  };
}

export function field(item, name) {
  const value = item[name] ?? item[name.toLowerCase()] ?? item.fieldValues?.find?.((entry) => entry.field?.name === name)?.name;
  return typeof value === 'string' ? value : value?.name || '';
}

export function title(item) {
  return item.title || item.content?.title || '(untitled)';
}

export function url(item) {
  return item.url || item.content?.url || '';
}

export function normalizeRestItem(item) {
  const fields = Object.fromEntries((item.fields || []).map((entry) => {
    const value = entry.value?.name?.raw ?? entry.value?.raw ?? entry.value?.name ?? entry.value ?? '';
    return [entry.name.toLowerCase(), typeof value === 'string' ? value : String(value)];
  }));
  const content = item.content || {};
  return {
    ...fields,
    id: item.node_id,
    restId: item.id,
    title: content.title || '(untitled)',
    url: content.html_url || '',
    createdAt: content.created_at || item.created_at,
    updatedAt: content.updated_at || item.updated_at,
    content: {
      type: item.content_type,
      title: content.title,
      body: content.body,
      number: content.number,
      repository: content.repository?.full_name,
      url: content.html_url,
    },
  };
}

export function slug(value) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'intake';
}

export function issueRef(value) {
  const match = text(value).match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)(?:[/?#].*)?$/i);
  if (!match) throw new Error('Use a full GitHub issue URL');
  return { owner: match[1], repo: match[2], number: Number(match[3]), url: `https://github.com/${match[1]}/${match[2]}/issues/${match[3]}` };
}

export function normalizeChoice(value) {
  return text(value).toLowerCase();
}

export function sameTitle(left, right) {
  return normalizeChoice(left) === normalizeChoice(right);
}

export function scopeProductItems(items, { repository, product }) {
  const repositoryItems = items.filter((item) => normalizeChoice(item.content?.repository) === normalizeChoice(repository));
  if (!product || !repositoryItems.some((item) => field(item, 'Product'))) return repositoryItems;
  return repositoryItems.filter((item) => normalizeChoice(field(item, 'Product')) === normalizeChoice(product));
}

function words(value) {
  return new Set(text(value).toLowerCase().match(/[a-z0-9]{4,}/g) || []);
}

export function matchingItems(items, query, options = {}) {
  const needle = text(query).toLowerCase();
  const queryWords = words(query);
  return items.filter((item) => {
    const haystack = [title(item), item.content?.body, url(item), field(item, 'Status'), field(item, 'Product'), field(item, 'Maturity'), field(item, 'Area')]
      .filter(Boolean).join(' ').toLowerCase();
    if (haystack.includes(needle)) return true;
    if (!options.fuzzy || !queryWords.size) return false;
    const haystackWords = words(haystack);
    const overlap = [...queryWords].filter((word) => haystackWords.has(word)).length;
    return overlap >= Math.min(2, queryWords.size);
  });
}

export function planRows(items, filters = {}) {
  const inactive = new Set(['done', 'deferred']);
  return items
    .filter((item) => filters.includeInactive || !inactive.has(normalizeChoice(field(item, 'Status'))))
    .filter((item) => !filters.product || normalizeChoice(field(item, 'Product')).includes(normalizeChoice(filters.product)))
    .filter((item) => !filters.maturity || normalizeChoice(field(item, 'Maturity')).includes(normalizeChoice(filters.maturity)))
    .filter((item) => !filters.area || normalizeChoice(field(item, 'Area')).includes(normalizeChoice(filters.area)))
    .map((item) => ({
      product: field(item, 'Product'), maturity: field(item, 'Maturity'), area: field(item, 'Area'), status: field(item, 'Status'),
      type: field(item, 'Type'), priority: field(item, 'Priority'), title: title(item), url: url(item),
    }))
    .sort((a, b) => [a.maturity, a.area, a.priority, a.title].join('|').localeCompare([b.maturity, b.area, b.priority, b.title].join('|')));
}
