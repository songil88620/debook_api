import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsGeneralString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isGeneralString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // const isValid = /^[a-zA-Z0-9 .,!?'"@-]*$/.test(value);
          const isValid =
            /^[a-zA-Z0-9 .,!?'"@-⭑✿💥🎉🧑‍💻\p{S}\p{P}\p{L}\p{N}\p{Emoji}\s]*$/gu.test(
              value,
            );

          // const isSafeFromSqlInjection =
          //   !/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|--|;|'|"|\\)\b)/i.test(
          //     value,
          //   );
          return isValid;
          // return isValid && isSafeFromSqlInjection;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid string containing only safe characters and free of SQL injection patterns.`;
        },
      },
    });
  };
}
