# This code was generated by a tool.
# ility@{{version}}
#
# Changes to this file may cause incorrect behavior and will be lost if
# the code is regenerated.

# typed: strict

require 'typed_struct_helper'

module IlityExample::V1
  class ExhaustiveParamsBody < T::Struct
    extend T::Sig
    include TypedStructHelper

    const :foo, T.nilable(String)
    const :bar, T.nilable(String)
  end
end
