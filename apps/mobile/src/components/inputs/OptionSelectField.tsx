import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { TeamExperienceTheme } from '../../theme/teamExperienceTheme';

export type OptionSelectItem<TValue extends string = string> = {
  value: TValue;
  label: string;
  shortLabel?: string;
  description?: string;
  disabled?: boolean;
  group?: string;
};

type OptionSelectFieldProps<TValue extends string = string> = {
  emptyLabel?: string;
  label: string;
  modalTitle?: string;
  onChange: (value: TValue[]) => void;
  options: Array<OptionSelectItem<TValue>>;
  placeholder?: string;
  searchPlaceholder?: string;
  selectionMode?: 'single' | 'multi';
  theme: TeamExperienceTheme;
  value: TValue[];
  nativeID?: string;
  testID?: string;
};

export function OptionSelectField<TValue extends string = string>({
  emptyLabel = 'Nenhuma opcao encontrada.',
  label,
  modalTitle,
  onChange,
  options,
  placeholder = 'Selecionar',
  searchPlaceholder = 'Buscar',
  selectionMode = 'single',
  theme,
  value,
  nativeID,
  testID,
}: OptionSelectFieldProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedValues = useMemo(() => new Set(value), [value]);
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.has(option.value)),
    [options, selectedValues],
  );
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const searchableText = normalizeText(
        [option.label, option.shortLabel, option.description, option.group].filter(Boolean).join(' '),
      );

      return searchableText.includes(normalizedQuery);
    });
  }, [options, query]);
  const groupedOptions = useMemo(() => {
    return filteredOptions.reduce<Array<{ group: string | null; items: Array<OptionSelectItem<TValue>> }>>(
      (groups, option) => {
        const groupName = option.group ?? null;
        const currentGroup = groups.find((group) => group.group === groupName);

        if (currentGroup) {
          currentGroup.items.push(option);
          return groups;
        }

        groups.push({ group: groupName, items: [option] });
        return groups;
      },
      [],
    );
  }, [filteredOptions]);

  function handleToggleOption(option: OptionSelectItem<TValue>) {
    if (option.disabled) {
      return;
    }

    if (selectionMode === 'single') {
      onChange(selectedValues.has(option.value) ? [] : [option.value]);
      setIsOpen(false);
      setQuery('');
      return;
    }

    if (selectedValues.has(option.value)) {
      onChange(value.filter((item) => item !== option.value));
      return;
    }

    onChange([...value, option.value]);
  }

  function handleClose() {
    setIsOpen(false);
    setQuery('');
  }

  const summaryLabel = getSummaryLabel(selectedOptions, placeholder);

  return (
    <View className="gap-2" nativeID={nativeID} testID={testID}>
      <Text className="text-[0.95rem] font-bold leading-5" style={{ color: theme.accentPrimary }}>
        {label}
      </Text>

      <Pressable
        accessibilityRole="button"
        className="min-h-[48px] flex-row items-center justify-between rounded-[18px] border px-3 py-2"
        onPress={() => setIsOpen(true)}
        style={{
          backgroundColor: theme.surfaceBase,
          borderColor: selectedOptions.length ? theme.accentPrimary : theme.borderDefault,
        }}
      >
        <View className="min-w-0 flex-1 pr-3">
          {selectedOptions.length ? (
            <View className="flex-row flex-wrap gap-2">
              {selectedOptions.map((option) => (
                <View
                  key={option.value}
                  className="min-h-[28px] items-center justify-center rounded-full border px-2"
                  style={{
                    backgroundColor: `${theme.accentPrimary}18`,
                    borderColor: `${theme.accentPrimary}AA`,
                  }}
                >
                  <Text className="text-[0.8rem] font-bold leading-4" style={{ color: theme.accentPrimary }}>
                    {option.shortLabel ?? option.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-[0.95rem] leading-5" style={{ color: theme.textMuted }}>
              {summaryLabel}
            </Text>
          )}
        </View>

        <Ionicons color={theme.accentPrimary} name="chevron-down" size={18} />
      </Pressable>

      <Modal animationType="fade" transparent visible={isOpen} onRequestClose={handleClose}>
        <View className="flex-1 justify-end bg-black/70 px-4 pb-4">
          <View
            className="max-h-[82%] rounded-[24px] border p-4"
            style={{ backgroundColor: theme.surfaceCard, borderColor: theme.borderDefault }}
          >
            <View className="mb-4 flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="font-slab text-[1.35rem] leading-6" style={{ color: theme.accentPrimary }}>
                  {modalTitle ?? label}
                </Text>
                <Text className="mt-1 text-[0.85rem] leading-4" style={{ color: theme.textMuted }}>
                  {selectionMode === 'multi' ? 'Selecione uma ou mais opcoes.' : 'Selecione uma opcao.'}
                </Text>
              </View>

              <Pressable accessibilityRole="button" className="h-9 w-9 items-center justify-center rounded-full" onPress={handleClose}>
                <Ionicons color={theme.textMuted} name="close" size={18} />
              </Pressable>
            </View>

            <TextInput
              className="mb-3 min-h-[44px] rounded-[16px] border px-3 text-[0.95rem]"
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.textMuted}
              style={{
                backgroundColor: theme.surfaceBase,
                borderColor: theme.borderDefault,
                color: theme.textPrimary,
              }}
              value={query}
            />

            <ScrollView className="max-h-[440px]" showsVerticalScrollIndicator={false}>
              {groupedOptions.length ? (
                <View className="gap-4">
                  {groupedOptions.map((group) => (
                    <View key={group.group ?? 'ungrouped'} className="gap-2">
                      {group.group ? (
                        <Text className="text-[0.78rem] font-bold uppercase leading-4" style={{ color: theme.textMuted }}>
                          {group.group}
                        </Text>
                      ) : null}

                      <View className="gap-2">
                        {group.items.map((option) => {
                          const isSelected = selectedValues.has(option.value);

                          return (
                            <Pressable
                              key={option.value}
                              accessibilityRole={selectionMode === 'multi' ? 'checkbox' : 'button'}
                              accessibilityState={{ checked: isSelected, disabled: option.disabled }}
                              className="min-h-[54px] flex-row items-center gap-3 rounded-[18px] border px-3 py-2"
                              disabled={option.disabled}
                              onPress={() => handleToggleOption(option)}
                              style={{
                                backgroundColor: isSelected ? `${theme.accentPrimary}1F` : theme.surfaceBase,
                                borderColor: isSelected ? theme.accentPrimary : theme.borderDefault,
                                opacity: option.disabled ? 0.5 : 1,
                              }}
                            >
                              {option.shortLabel ? (
                                <View
                                  className="h-9 min-w-10 items-center justify-center rounded-full border px-2"
                                  style={{
                                    backgroundColor: isSelected ? theme.accentPrimary : theme.surfaceCard,
                                    borderColor: isSelected ? theme.accentPrimary : theme.borderDefault,
                                  }}
                                >
                                  <Text
                                    className="text-[0.8rem] font-bold leading-4"
                                    style={{ color: isSelected ? theme.accentOnPrimary : theme.textPrimary }}
                                  >
                                    {option.shortLabel}
                                  </Text>
                                </View>
                              ) : null}

                              <View className="min-w-0 flex-1">
                                <Text className="text-[0.98rem] font-bold leading-5" style={{ color: theme.textPrimary }}>
                                  {option.label}
                                </Text>
                                {option.description ? (
                                  <Text className="mt-1 text-[0.82rem] leading-4" style={{ color: theme.textMuted }}>
                                    {option.description}
                                  </Text>
                                ) : null}
                              </View>

                              <Ionicons
                                color={isSelected ? theme.accentPrimary : theme.textMuted}
                                name={selectionMode === 'multi' ? (isSelected ? 'checkbox' : 'square-outline') : isSelected ? 'radio-button-on' : 'radio-button-off'}
                                size={20}
                              />
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="min-h-[96px] items-center justify-center">
                  <Text className="text-center text-[0.95rem] leading-5" style={{ color: theme.textMuted }}>
                    {emptyLabel}
                  </Text>
                </View>
              )}
            </ScrollView>

            {selectionMode === 'multi' ? (
              <Pressable
                accessibilityRole="button"
                className="mt-4 min-h-[46px] items-center justify-center rounded-[16px] px-4"
                onPress={handleClose}
                style={{ backgroundColor: theme.accentPrimary }}
              >
                <Text className="text-[0.95rem] font-bold leading-5" style={{ color: theme.accentOnPrimary }}>
                  Confirmar
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getSummaryLabel<TValue extends string>(selectedOptions: Array<OptionSelectItem<TValue>>, placeholder: string) {
  if (!selectedOptions.length) {
    return placeholder;
  }

  if (selectedOptions.length === 1) {
    return selectedOptions[0].label;
  }

  return `${selectedOptions.length} selecionadas`;
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
