import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

export function DropdownMenu({ trigger, items, className = '' }) {
  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <Menu.Button as={Fragment}>
        {trigger}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="absolute right-0 z-[9999] mt-2 w-48 origin-top-right rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg focus:outline-none ring-1 ring-gray-200 dark:ring-gray-700 divide-y divide-gray-200 dark:divide-gray-700"
        >
          {items.map((item, index) => (
            <Menu.Item key={item.key || index} disabled={item.disabled}>
              {({ active }) => (
                <button
                  className={`
                    w-full px-4 py-2.5 text-left text-sm
                    ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                    ${item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                    flex items-center gap-3
                  `}
                  onClick={item.onClick}
                  disabled={item.disabled}
                >
                  {item.icon && <item.icon className="w-5 h-5 shrink-0" />}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && <span className="text-xs text-gray-400 dark:text-gray-500">{item.shortcut}</span>}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export function SelectMenu({ value, options, onChange, placeholder, className = '', disabled = false }) {
  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white/50 dark:bg-gray-800/50
            border transition-all duration-200
            text-left
            ${disabled
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            }
            ${className}
          `}
        >
          {value ? options.find(o => o.value === value)?.label : placeholder}
        </button>
      }
      items={options.map(opt => ({
        key: opt.value,
        label: opt.label,
        onClick: () => onChange(opt.value),
        icon: opt.icon,
      }))}
    />
  );
}