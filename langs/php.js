define([
  './Default',
  'util/regex'
], function(Default, regex) {
  return Default.extend({

    init: function() {
      this._super();
      this.setInfo({
        name: 'PHP'
      });
      this.getElements().merge({
        comment: '\#.*?$',
        string: '<<<EOT.*?^EOT',
        keyword: regex.words(
          ['unset', 'print', 'return', 'require_once', 'require', 'list', 'isset', 'include_once',
            'include', 'eval', 'exit', 'empty', 'echo', 'die'],
          ['__NAMESPACE__', '__METHOD__', '__FUNCTION__', '__LINE__', '__FILE__', '__DIR__',
            '__CLASS__']),
        tag: /<\?php\b|<\?|\?>/,
        variable: /\$[a-z_]\w*\b/,
        entity: regex.alt(regex.words(
          ['__COMPILER_HALT_OFFSET__', 'YESSTR', 'YESEXPR', 'T_FMT_AMPM', 'T_FMT', 'THOUSEP',
            'THOUSANDS_SEP', 'STR_PAD_RIGHT', 'STR_PAD_LEFT', 'STR_PAD_BOTH', 'SORT_STRING',
            'SORT_REGULAR', 'SORT_NUMERIC', 'SORT_DESC', 'SORT_ASC', 'SEEK_SET', 'SEEK_END',
            'SEEK_CUR', 'RADIXCHAR', 'P_SIGN_POSN', 'P_SEP_BY_SPACE', 'P_CS_PRECEDES',
            'POSITIVE_SIGN', 'PM_STR', 'PHP_ZTS', 'PHP_WINDOWS_VERSION_SUITEMASK',
            'PHP_WINDOWS_VERSION_SP_MINOR', 'PHP_WINDOWS_VERSION_SP_MAJOR',
            'PHP_WINDOWS_VERSION_PRODUCTTYPE', 'PHP_WINDOWS_VERSION_PLATFORM',
            'PHP_WINDOWS_VERSION_MINOR', 'PHP_WINDOWS_VERSION_MAJOR', 'PHP_WINDOWS_VERSION_BUILD',
            'PHP_WINDOWS_NT_WORKSTATION', 'PHP_WINDOWS_NT_SERVER',
            'PHP_WINDOWS_NT_DOMAIN_CONTROLLER', 'PHP_VERSION_ID', 'PHP_VERSION', 'PHP_SYSCONFDIR',
            'PHP_SHLIB_SUFFIX', 'PHP_SAPI', 'PHP_RELEASE_VERSION', 'PHP_PREFIX',
            'PHP_OUTPUT_HANDLER_START', 'PHP_OUTPUT_HANDLER_END', 'PHP_OUTPUT_HANDLER_CONT',
            'PHP_OS', 'PHP_MINOR_VERSION', 'PHP_MAXPATHLEN', 'PHP_MAJOR_VERSION',
            'PHP_LOCALSTATEDIR', 'PHP_LIBDIR', 'PHP_INT_SIZE', 'PHP_INT_MAX', 'PHP_EXTRA_VERSION',
            'PHP_EXTENSION_DIR', 'PHP_EOL', 'PHP_DEBUG', 'PHP_DATADIR', 'PHP_CONFIG_FILE_SCAN_DIR',
            'PHP_CONFIG_FILE_PATH', 'PHP_BINDIR', 'PEAR_INSTALL_DIR', 'PEAR_EXTENSION_DIR',
            'PATH_SEPARATOR', 'PATHINFO_EXTENSION', 'PATHINFO_DIRNAME', 'PATHINFO_BASENAME',
            'N_SIGN_POSN', 'N_SEP_BY_SPACE', 'N_CS_PRECEDES', 'NOSTR', 'NOEXPR', 'NEGATIVE_SIGN',
            'M_SQRT2', 'M_SQRT1_2', 'M_PI_4', 'M_PI_2', 'M_PI', 'M_LOG2E', 'M_LOG10E', 'M_LN2',
            'M_LN10', 'M_E', 'M_2_SQRTPI', 'M_2_PI', 'M_1_PI', 'MON_THOUSANDS_SEP', 'MON_GROUPING',
            'MON_DECIMAL_POINT', 'MON_9', 'MON_8', 'MON_7', 'MON_6', 'MON_5', 'MON_4', 'MON_3',
            'MON_2', 'MON_12', 'MON_11', 'MON_10', 'MON_1', 'LOG_WARNING', 'LOG_UUCP', 'LOG_USER',
            'LOG_SYSLOG', 'LOG_PID', 'LOG_PERROR', 'LOG_ODELAY', 'LOG_NOWAIT', 'LOG_NOTICE',
            'LOG_NEWS', 'LOG_NDELAY', 'LOG_MAIL', 'LOG_LPR', 'LOG_LOCAL7', 'LOG_LOCAL6',
            'LOG_LOCAL5', 'LOG_LOCAL4', 'LOG_LOCAL3', 'LOG_LOCAL2', 'LOG_LOCAL1', 'LOG_LOCAL0',
            'LOG_KERN', 'LOG_INFO', 'LOG_ERR', 'LOG_EMERG', 'LOG_DEBUG', 'LOG_DAEMON', 'LOG_CRON',
            'LOG_CRIT', 'LOG_CONS', 'LOG_AUTHPRIV', 'LOG_AUTH', 'LOG_ALERT', 'LOCK_UN', 'LOCK_SH',
            'LOCK_NB', 'LOCK_EX', 'LC_TIME', 'LC_NUMERIC', 'LC_MONETARY', 'LC_MESSAGES', 'LC_CTYPE',
            'LC_COLLATE', 'LC_ALL', 'INT_FRAC_DIGITS', 'INT_CURR_SYMBOL', 'INI_USER', 'INI_SYSTEM',
            'INI_PERDIR', 'INI_ALL', 'INFO_VARIABLES', 'INFO_MODULES', 'INFO_LICENSE',
            'INFO_GENERAL', 'INFO_ENVIRONMENT', 'INFO_CREDITS', 'INFO_CONFIGURATION', 'INFO_ALL',
            'HTML_SPECIALCHARS', 'HTML_ENTITIES', 'GROUPING', 'FRAC_DIGITS', 'E_WARNING',
            'E_USER_WARNING', 'E_USER_NOTICE', 'E_USER_ERROR', 'E_USER_DEPRECATED', 'E_STRICT',
            'E_PARSE', 'E_NOTICE', 'E_ERROR', 'E_DEPRECATED', 'E_CORE_WARNING', 'E_CORE_ERROR',
            'E_COMPILE_WARNING', 'E_COMPILE_ERROR', 'E_ALL', 'EXTR_SKIP', 'EXTR_PREFIX_SAME',
            'EXTR_PREFIX_INVALID', 'EXTR_PREFIX_IF_EXISTS', 'EXTR_PREFIX_ALL', 'EXTR_OVERWRITE',
            'EXTR_IF_EXISTS', 'ERA_YEAR', 'ERA_T_FMT', 'ERA_D_T_FMT', 'ERA_D_FMT', 'ERA',
            'ENT_QUOTES', 'ENT_NOQUOTES', 'ENT_COMPAT', 'D_T_FMT', 'D_FMT', 'DIRECTORY_SEPARATOR',
            'DEFAULT_INCLUDE_PATH', 'DECIMAL_POINT', 'DAY_7', 'DAY_6', 'DAY_5', 'DAY_4', 'DAY_3',
            'DAY_2', 'DAY_1', 'CURRENCY_SYMBOL', 'CRYPT_STD_DES', 'CRYPT_SALT_LENGTH', 'CRYPT_MD5',
            'CRYPT_EXT_DES', 'CRYPT_BLOWFISH', 'CRNCYSTR', 'CREDITS_SAPI', 'CREDITS_QA',
            'CREDITS_MODULES', 'CREDITS_GROUP', 'CREDITS_GENERAL', 'CREDITS_FULLPAGE',
            'CREDITS_DOCS', 'CREDITS_ALL', 'COUNT_RECURSIVE', 'COUNT_NORMAL', 'CONNECTION_TIMEOUT',
            'CONNECTION_NORMAL', 'CONNECTION_ABORTED', 'CODESET', 'CHAR_MAX', 'CASE_UPPER',
            'CASE_LOWER', 'ASSERT_WARNING', 'ASSERT_QUIET_EVAL', 'ASSERT_CALLBACK', 'ASSERT_BAIL',
            'ASSERT_ACTIVE', 'AM_STR', 'ALT_DIGITS', 'ABMON_9', 'ABMON_8', 'ABMON_7', 'ABMON_6',
            'ABMON_5', 'ABMON_4', 'ABMON_3', 'ABMON_2', 'ABMON_12', 'ABMON_11', 'ABMON_10',
            'ABMON_1', 'ABDAY_7', 'ABDAY_6', 'ABDAY_5', 'ABDAY_4', 'ABDAY_3', 'ABDAY_2', 'ABDAY_1'
          ]), /\b[a-z_]\w*::/),
        identifier: /\b[a-z_]\w*\b\s*(?=\([^\)]*\))/,
        constant: /\b[A-Z_]*\b/
      });
      this.getElements().append({
        _modifiers: 'gm',
        constant: /\b[A-Z_]*\b/
      });
    }

  });
});
