# This code was generated by a tool.
# ility@{{version}}
#
# Changes to this file may cause incorrect behavior and will be lost if
# the code is regenerated.

# typed: strict

require 'typed_struct_helper'

module IlityExample::V1
  class NewWidget < T::Struct
    extend T::Sig
    include TypedStructHelper

    const :name, T.nilable(String)
    const :fiz, T.nilable(Numeric)
    const :buzz, T.nilable(Numeric)
    const :fizbuzz, T.nilable(Numeric)
    const :foo, T.nilable(IlityExample::V1::NewWidgetFoo)
  end
end
