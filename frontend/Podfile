# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native/scripts/react_native_pods.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

platform :ios, min_ios_version_supported
prepare_react_native_project!

# Explicitly set this to disable IP address writing which causes sandbox issues
ENV['RCT_SKIP_IP_ADDRESS'] = 'true'

linkage = ENV['USE_FRAMEWORKS']
if linkage != nil
  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
  use_frameworks! :linkage => linkage.to_sym
end

target 'Eindr' do
  config = use_native_modules!

  pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'

  use_react_native!(
    :path => config[:reactNativePath],
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    # https://github.com/facebook/react-native/blob/main/packages/react-native/scripts/react_native_pods.rb#
L197-L202
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      # :ccache_enabled => true
    )
    
    # Add fix for non-modular includes in framework modules
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min_ios_version_supported
        
        # Fix for architecture issues
        config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
        
        # Add RCT_SKIP_IP_ADDRESS preprocessing flag
        if config.build_settings['GCC_PREPROCESSOR_DEFINITIONS']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'RCT_SKIP_IP_ADDRESS=1'
        else
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = ['$(inherited)', 'RCT_SKIP_IP_ADDRESS=1']
        end
      end
    end
  end
end 