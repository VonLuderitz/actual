import React, { type ComponentPropsWithoutRef } from 'react';

import * as monthUtils from 'loot-core/src/shared/months';

import { theme } from '../../style';
import { CategoryAutocomplete } from '../autocomplete/CategoryAutocomplete';
import {
  ModalCloseButton,
  Modal,
  ModalTitle,
  ModalHeader,
} from '../common/Modal';
import { View } from '../common/View';
import { SectionLabel } from '../forms';
import { useResponsive } from '../responsive/ResponsiveProvider';
import { NamespaceContext } from '../spreadsheet/NamespaceContext';

type CategoryAutocompleteModalProps = {
  autocompleteProps: ComponentPropsWithoutRef<typeof CategoryAutocomplete>;
  onClose: () => void;
  month?: string;
};

export function CategoryAutocompleteModal({
  autocompleteProps,
  month,
  onClose,
}: CategoryAutocompleteModalProps) {
  const { isNarrowWidth } = useResponsive();

  const defaultAutocompleteProps = {
    containerProps: { style: { height: isNarrowWidth ? '90vh' : 275 } },
  };

  return (
    <Modal
      name="category-autocomplete"
      noAnimation={!isNarrowWidth}
      onClose={onClose}
      containerProps={{
        style: {
          height: isNarrowWidth ? '85vh' : 275,
          backgroundColor: theme.menuAutoCompleteBackground,
        },
      }}
    >
      {({ state: { close } }) => (
        <>
          {isNarrowWidth && (
            <ModalHeader
              title={
                <ModalTitle
                  title="Category"
                  getStyle={() => ({ color: theme.menuAutoCompleteText })}
                />
              }
              rightContent={
                <ModalCloseButton
                  onPress={close}
                  style={{ color: theme.menuAutoCompleteText }}
                />
              }
            />
          )}
          <View>
            {!isNarrowWidth && (
              <SectionLabel
                title="Category"
                style={{
                  alignSelf: 'center',
                  color: theme.menuAutoCompleteText,
                  marginBottom: 10,
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <NamespaceContext.Provider
                value={month ? monthUtils.sheetForMonth(month) : ''}
              >
                <CategoryAutocomplete
                  autoFocus={true}
                  embedded={true}
                  closeOnBlur={false}
                  showSplitOption={false}
                  onClose={close}
                  {...defaultAutocompleteProps}
                  {...autocompleteProps}
                />
              </NamespaceContext.Provider>
            </View>
          </View>
        </>
      )}
    </Modal>
  );
}
